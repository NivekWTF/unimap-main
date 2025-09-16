import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box, Button, Stack, Typography } from "@mui/material";
import { AttachFile } from "@mui/icons-material";

import ImageList from "../../../../components/ui/ImageList";
import FormField from "../../../../components/forms/FormField";
import FormSelect from "../../../../components/forms/FormSelect";
import FormFile from "../../../../components/forms/FormFile";
import Formulario from "../../../../containers/Formulario";
import Map from "../../../../components/ui/Map";
import ModalFotografia from "../../components/ModalFotografia";

import useCategoria from "../../../../hooks/useCategoria";
import trpc from "@api";
import useAlert from "../../../../hooks/useAlert";
import { useMutation } from "@tanstack/react-query";
import {
  ARCHIVO_GEOJSON_INVALIDO,
  Alertas,
  Formularios,
} from "../../../../constant/mensajes";
import { poligonoSchema } from "../../../../utils/validators";
import {
  crearGeoJsonDesdeGeometria,
  validarArchivoGeoJson,
} from "../../../../utils/functions";
import { Categoria, GeoJSON } from "../../../../utils/types";
import { upsertObjeto } from "../../../../services/objetos";
import { crearFormData } from "../../../../utils/functions";

const formularioSchema = z
  .object({
    _id: z.string().optional(),
    nombre: z.string().min(1, Formularios.required),
    nombreCorto: z
      .string()
      .min(1, Formularios.required)
      .max(5, Formularios.max(5)),
    descripcion: z.string().min(1, Formularios.required),
    qgisId: z.string().min(1, Formularios.required).max(5, Formularios.max(5)),
    pisos: z.number({ coerce: true }).optional().default(1),
    pertenecePiso: z.number({ coerce: true }).optional().default(1),
    categoria: z.string().min(1, Formularios.required),
    campus: z.string().min(1, Formularios.required),
    servicios: z.array(z.string()),
    archivoGeojson: z.any().optional(),
    geometria: poligonoSchema.optional(),
    archivosImagenes: z.array(z.any()),
    imagenes: z.array(z.string()),
    categoriaNombre: z.string().optional(),
    debeTenerPadre: z.boolean().optional(),
    pertenece: z.string().optional(),
  })
  .refine(
    ({ debeTenerPadre, pertenece }) => {
      if (!debeTenerPadre) return true;
      return !!pertenece;
    },
    {
      message: Formularios.required,
      path: ["pertenece"],
    },
  )
  .refine(
    ({ _id, archivoGeojson }) => {
      if (_id) return true;
      return archivoGeojson && archivoGeojson instanceof File;
    },
    {
      message: Formularios.required,
      path: ["archivoGeojson"],
    },
  );

type Formulario = z.infer<typeof formularioSchema>;

const FormularioObjetos: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const categoria = useCategoria();

  const pertenece = useMemo(() => categoria?.pertenece || [], [categoria]);
  const debeTenerPadre = useMemo(() => !!pertenece.length, [pertenece]);

  const setAlert = useAlert();

  const form = useForm<Formulario>({
    resolver: zodResolver(formularioSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      categoria: categoria?._id,
      campus: "",
      servicios: [],
      archivoGeojson: null as File | null,
      imagenes: [],
      archivosImagenes: [],
      categoriaNombre: categoria?.nombre,
      debeTenerPadre,
    },
  });

  const [geojsonKey, setGeojsonKey] = useState<string>("");
  const [geojson, setGeojson] = useState<GeoJSON | null>(null);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [isModalFotografiaOpen, setIsModalFotografiaOpen] =
    useState<boolean>(false);

  const archivoGeoJson = form.watch("archivoGeojson");
  const campus = form.watch("campus");

  const { data: campusBd } = trpc.campus.obtener.useQuery();
  const { data: objetosPadre } = trpc.objetos.obtenerTodos.useQuery(
    {
      categoria: pertenece.map(({ _id }) => _id),
      campus,
    },
    {
      enabled: debeTenerPadre && !!campus,
    },
  );

  const { data: servicios } = trpc.servicios.obtenerTodos.useQuery();

  const { data: objeto } = trpc.objetos.obtenerPorId.useQuery(
    {
      id: id!,
    },
    {
      enabled: !!id,
    },
  );

  const opcionesPertenece = useMemo(
    () =>
      objetosPadre?.map(({ _id, nombre, categoria }) => ({
        _id,
        nombre: `${nombre} (${(categoria as Categoria).nombre})`,
      })) || [],
    [objetosPadre],
  );

  const { mutate: guardar } = useMutation({
    mutationKey: ["upsert-objeto", id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: ({ archivoGeojson, ...data }: Formulario) =>
      upsertObjeto(crearFormData(data), id),
    onSuccess: () => {
      navigate(`/${categoria?._id}`);
      setAlert({ message: Alertas.guardado, type: "success" });
    },
  });

  const handleRegresar = useCallback(() => {
    navigate(`/${categoria?._id}`);
  }, [categoria, navigate]);

  const validarGeoJson = useCallback(async () => {
    if (!archivoGeoJson) return;

    const resultado = await validarArchivoGeoJson(archivoGeoJson);
    if (!resultado.success) {
      form.setError("archivoGeojson", {
        type: "manual",
        message: ARCHIVO_GEOJSON_INVALIDO,
      });
      return;
    }

    form.clearErrors("archivoGeojson");
    const { data } = resultado;

    form.setValue("geometria", data.features[0].geometry);
    setGeojsonKey(archivoGeoJson.name);
    setGeojson(data);
  }, [archivoGeoJson, form]);

  const handleAgregarFotografiaClick = useCallback(() => {
    setIsModalFotografiaOpen(true);
  }, []);

  const handleFotografiaAgregada = useCallback(
    (src: string, file: File) => {
      setImagenes((prev) => [...prev, src]);
      form.setValue("archivosImagenes", [
        ...form.getValues().archivosImagenes,
        file,
      ]);
      setIsModalFotografiaOpen(false);
    },
    [form],
  );

  const handleFotografiaEliminada = useCallback(
    (index: number) => {
      const { imagenes: imagenesExistentes, archivosImagenes } =
        form.getValues();

      const cantidadExistentes = imagenesExistentes.length;
      if (cantidadExistentes && index < cantidadExistentes) {
        form.setValue(
          "imagenes",
          imagenesExistentes.filter((_, i) => index !== i),
        );
      } else {
        form.setValue(
          "archivosImagenes",
          archivosImagenes.filter((_, i) => index !== i + cantidadExistentes),
        );
      }

      setImagenes((prev) => prev.filter((_, i) => index !== i));
    },
    [form],
  );

  const inicializarFormularioEdicion = useCallback(
    (obj: typeof objeto) => {
      if (!obj) return;

      obj.archivosImagenes = [];
      form.reset(obj as unknown as Formulario);
      setImagenes(obj.urlImagenes || []);

      const geojson = crearGeoJsonDesdeGeometria(obj.geometria, {
        qgisId: obj.nombreCorto,
      });
      setGeojsonKey(obj._id);
      setGeojson(geojson);
    },
    [form],
  );

  useEffect(() => {
    validarGeoJson();
  }, [validarGeoJson]);

  useEffect(() => {
    if (objeto) {
      inicializarFormularioEdicion(objeto);
    }
  }, [objeto, inicializarFormularioEdicion]);

  return (
    <>
      <ModalFotografia
        open={isModalFotografiaOpen}
        onAgregar={handleFotografiaAgregada}
        onClose={() => setIsModalFotografiaOpen(false)}
      />
      <Formulario
        form={form}
        title={categoria.nombre}
        onSubmit={guardar}
        onCancel={handleRegresar}
      >
        <FormField name="nombre" label="Nombre" />
        <FormField name="nombreCorto" label="Nombre corto" />
        <FormField
          label="Categoría"
          name="categoriaNombre"
          InputProps={{ readOnly: true }}
        />
        <FormField label="Qgis ID" name="qgisId" />
        <FormField
          name="descripcion"
          label="Descripcion"
          rows={3}
          sx={{ gridColumn: "span 2 " }}
          multiline
        />
        <Typography variant="h6" color="warning.main" gridColumn="span 2">
          Datos del objeto
        </Typography>
        <FormSelect
          name="campus"
          label="Campus"
          options={campusBd!}
          disabled={!campusBd}
        />
        {debeTenerPadre && (
          <FormSelect
            name="pertenece"
            label="Pertenece a"
            options={opcionesPertenece!}
            disabled={!opcionesPertenece.length}
          />
        )}
        <FormSelect
          name="servicios"
          label="Servicios"
          options={servicios!}
          multi
        />
        {debeTenerPadre && (
          <FormField
            name="pertenecePiso"
            label="Piso"
            type="number"
            inputProps={{ min: 0 }}
          />
        )}
        {!debeTenerPadre && (
          <FormField
            name="pisos"
            label="Pisos"
            type="number"
            inputProps={{ min: 1 }}
          />
        )}
        <Typography variant="h6" color="warning.main" gridColumn="span 2">
          Detalles geógraficos
        </Typography>
        <FormFile
          name="archivoGeojson"
          label="Archivo GeoJSON"
          inputProps={{ accept: "application/json,.geojson" }}
          InputProps={{ startAdornment: <AttachFile /> }}
        />
        <Box />
        <Stack gap={1} gridColumn="span 2">
          <Map
            style={{ height: 320 }}
            geojson={geojson!}
            geojsonKey={geojsonKey}
          />
        </Stack>
        <Typography variant="h6" color="warning.main" gridColumn="span 2">
          Media
        </Typography>
        <Button
          onClick={handleAgregarFotografiaClick}
          variant="outlined"
          color="info"
        >
          Agregar fotografía
        </Button>
        <Box gridColumn="span 2">
          <ImageList images={imagenes} onDelete={handleFotografiaEliminada} />
        </Box>
      </Formulario>
    </>
  );
};

export default FormularioObjetos;
