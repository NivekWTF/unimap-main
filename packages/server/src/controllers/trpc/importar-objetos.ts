import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { privateProc } from '../../config/trpc';
import { geoJsonValidator } from '../../utilities/validators';
import { Campus } from '../../models/campus';
import { TGeoJsonFeatureImportar, TGeoJsonImportar } from '../../utilities/types';
import { Categoria, TCategoria } from '../../models/categoria';
import { Objeto, TObjeto } from '../../models/objeto';
import {
  CATEGORIA_SIN_RELACION,
  PISO_SUPERIOR_INEXISTENTE,
  REFERENCIA_CATEGORIA_INEXISTENTE,
  REFERENCIA_OBJETO_INEXISTENTE,
} from '../../constants/mensajes';

type TGeoJsonFeatureNuevoObjeto = Partial<
  TGeoJsonFeatureImportar & {
    _id: string;
    hijos: Partial<TGeoJsonFeatureImportar & { _id?: string }>[];
    pisos?: number;
    categoria: string | TCategoria;
  }
>;

type ArbolObjetos = TGeoJsonFeatureNuevoObjeto[];

type NuevosObjetosPorGgisId = Map<string, TGeoJsonFeatureNuevoObjeto>;

type ObjetosExistentesPorGgisId = Map<
  string,
  TObjeto & { hijos: TGeoJsonFeatureImportar[] }
>;

export const importar = privateProc
  .input(
    z.object({
      campus: z.string(),
      geoJson: z.array(geoJsonValidator),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { geoJson, campus } = input;

    const [campusBd, categorias, objetosExistentes] = await Promise.all([
      Campus.findById(campus, {
        activo: true,
      }),
      Categoria.find(
        {
          activo: true,
        },
        '_id pertenece'
      ),
      Objeto.find({
        campus: campus,
        activo: true,
      })
        .populate('categoria')
        .lean(),
    ]);

    if (!campusBd) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'La institución no existe.',
      });
    }

    const categoriasPorId = new Map(categorias.map((cat) => [cat._id, cat]));

    const objetosExistentesPorGgisId: ObjetosExistentesPorGgisId = new Map(
      objetosExistentes.map((objeto) => [objeto.qgisId, { ...objeto, hijos: [] }])
    );

    const nuevosObjetosPorGgisId: NuevosObjetosPorGgisId =
      crearMapaNuevosObjetosPorGgisId(geoJson);

    const arbol: ArbolObjetos = [];
    for (const [, objeto] of nuevosObjetosPorGgisId) {
      const {
        pertenece,
        categoria,
        qgisId,
        pertenecePiso = 1,
      } = objeto.properties!;

      const categoriaBd = categoriasPorId.get(categoria) as TCategoria;

      if (!categoriaBd) {
        throw new TRPCError({
          message: REFERENCIA_CATEGORIA_INEXISTENTE(qgisId, categoria),
          code: 'CONFLICT',
        });
      }

      if (objetosExistentesPorGgisId.has(qgisId)) {
        objeto._id = objetosExistentesPorGgisId.get(qgisId)!._id;
      }

      if (!pertenece) {        
        arbol.push(objeto);
        continue;
      }

      let padre = nuevosObjetosPorGgisId.get(pertenece);

      let categoriaPadre: string = '';
      let pisosPadre: number = 0;

      if (!padre) {
        const padreBd = objetosExistentesPorGgisId.get(pertenece) as TObjeto & {
          hijos: Partial<TGeoJsonFeatureImportar>[];
        };

        if (!padreBd) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: REFERENCIA_OBJETO_INEXISTENTE(pertenece),
          });
        }
     
        categoriaPadre = (padreBd.categoria as TCategoria)._id!;
        pisosPadre = padreBd.pisos!;

        padre = {
          properties: {
            qgisId: pertenece,
            categoria: categoriaPadre,
            nombre: padreBd.nombre,
            pisos: pisosPadre,
          },
          _id: padreBd._id,
          hijos: [],
        };

        arbol.push(padre);
        nuevosObjetosPorGgisId.set(pertenece, padre);
      } else {
        categoriaPadre = padre.properties!.categoria!;
        pisosPadre = padre.properties!.pisos!;
      }

      const categoriasPermitidas = categoriaBd.pertenece as string[];
      
      if (!categoriasPermitidas.includes(categoriaPadre!)) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: CATEGORIA_SIN_RELACION({
            categoriaHijo: categoria,
            categoriaPadre: categoriaPadre!,
            hijo: qgisId,
            padre: pertenece,
          }),
        });
      }

      if (pertenecePiso > pisosPadre!) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: PISO_SUPERIOR_INEXISTENTE({
            piso: pertenecePiso,
            padre: pertenece,
            hijo: qgisId,
            pisoMax: pisosPadre,
          }),
        });
      }

      if (!padre.hijos) {
        padre.hijos = [];
      }

      padre.hijos.push(objeto);
    }

    const {
      session: { _id: usuarioCreacion },
    } = ctx;

    return await guardarArbolDeObjetos({
      arbol,
      objetosExistentesPorGgisId,
      usuarioCreacion,
      campus,
    });
  });

function crearMapaNuevosObjetosPorGgisId(geoJson: TGeoJsonImportar[]) {
  const map = new Map<string, Partial<TGeoJsonFeatureImportar>>();

  for (const capa of geoJson) {
    const { features } = capa;

    for (const feat of features) {
      const { properties } = feat;
      const { qgisId } = properties;
      map.set(qgisId, feat);
    }
  }

  return map;
}

async function guardarArbolDeObjetos({
  arbol,
  objetosExistentesPorGgisId,
  usuarioCreacion,
  campus,
}: {
  arbol: ArbolObjetos;
  objetosExistentesPorGgisId: ObjetosExistentesPorGgisId;
  usuarioCreacion: string;
  campus: string;
}) {
  let inserciones: TObjeto[] = [];

  const recorrerArbol: any = async (objeto: ArbolObjetos[0]) => {
    let objetoBd: { _id: string };
    if (!objeto._id) {
      const {
        categoria,
        nombre,
        qgisId,
        pertenece,
        nombreCorto,
        pisos = 1,
      } = objeto.properties!;
      const padre = objetosExistentesPorGgisId.get(pertenece!);

      objetoBd = await Objeto.create({
        categoria,
        nombre,
        qgisId,
        nombreCorto,
        pertenece: padre?._id,
        geometria: objeto.geometry,
        usuarioCreacion,
        campus,
        pisos,
      });
      inserciones.push(objetoBd as TObjeto);
    } else {
      objetoBd = objeto as { _id: string };
    }

    const { hijos } = objeto;
    if (!hijos?.length) return [];

    const hijosParaInsertar = hijos
      .filter(({ _id }) => !_id)
      .map(({ geometry, properties }) => {
        const {
          categoria,
          nombre,
          qgisId,
          nombreCorto,
          pertenecePiso = 1,
        } = properties!;
        return {
          categoria,
          nombre,
          qgisId,
          nombreCorto,
          geometria: geometry,
          pertenece: objetoBd._id,
          usuarioCreacion,
          campus,
          pertenecePiso,
        };
      });

    const hijosBd = await Objeto.insertMany(hijosParaInsertar);
    inserciones = inserciones.concat(hijosBd as TObjeto[]);

    return await Promise.all(hijosBd.map((hijo) => recorrerArbol(hijo)));
  };

  await Promise.all(arbol.map((raiz) => recorrerArbol(raiz)));

  return inserciones;
}
