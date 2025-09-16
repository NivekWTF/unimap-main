import { useCallback, useMemo } from 'react';
import { StyleFunction } from 'leaflet';

import { Avatar, Box, Container, Stack } from '@mui/material';

import Categorias from './components/Categorias';
import Mapa from '../../components/map/Mapa';
import SearchField, { ItemBusqueda } from './components/SearchField';
import Swipeable from './components/Swipeable';
import ControlesObjeto from './components/ControlesObjeto';
import UserModal from '../../components/session/UserModal';

import api from '@api';

import useStore from '../../store';
import useObjetos from '../../hooks/useObjetos';
import useSwipableController from '../../hooks/useSwipableController';
import useMapController from '../../hooks/useMapController';
import useSession from '../../hooks/useSession';
import { Categoria, Geometria, Objeto } from '../../utils/types';
import {
  crearFeaturesDesdeGeometria,
  crearFeaturesDesdeObjetos,
  crearGeoJson,
  obtenerCentroide,
} from '../../utils/functions';
import { SwipeableTypes } from '../../constants/swipeable-types';
import { ZOOM_CAMPUS } from '../../constants/map';
import UserMarker from './components/UserMarker';

function Home() {
  const { user } = useSession();

  const { setObjetoSeleccionado, setCampusId, setBusqueda, setUserModalOpen } =
    useStore(
      ({
        setObjetoSeleccionado,
        setCampusId,
        setBusqueda,
        setUserModalOpen,
      }) => ({
        setObjetoSeleccionado,
        setCampusId,
        setBusqueda,
        setUserModalOpen,
      })
    );

  const { data: campus } = api.campus.obtenerPorSubdominio.useQuery(
    {},
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess({ _id }) {
        setCampusId(_id);
      },
    }
  );

  const { data: categorias } = api.categorias.obtenerTodos.useQuery(
    { habilitado: true },
    {
      enabled: !!campus,
    }
  );

  const categoriasPorId = useMemo(
    () => new Map(categorias?.map((c) => [c._id, c])),
    [categorias]
  );

  const {
    categoria,
    objetos,
    objetosPorId,
    objetosEnCapa,
    objetosEnCapaPorId,
    setCategoria,
  } = useObjetos(campus?._id);

  const {
    abrirSwipeableObjeto,
    cerrarSwipeable,
    seleccionarItemBusqueda,
    abrirSwipeable,
  } = useSwipableController();

  const { centrarMapaAObjeto, cambiarZoom } = useMapController();

  const centro = useMemo(() => {
    if (!campus) return { lat: 0, lng: 0 };
    return obtenerCentroide(campus.geometria);
  }, [campus]);

  const cerrarObjeto = useCallback(() => {
    setObjetoSeleccionado(null);
    cerrarSwipeable();
    cambiarZoom(ZOOM_CAMPUS);
  }, [setObjetoSeleccionado, cerrarSwipeable, cambiarZoom]);

  const featureCampus = useMemo(
    () =>
      campus
        ? crearFeaturesDesdeGeometria([campus!.geometria!], {
            onClick: cerrarObjeto,
            style: {},
            _id: campus._id,
          })
        : null,
    [campus, cerrarObjeto]
  );

  const geojson = useMemo(() => {
    if (!featureCampus) return null;
    if (!objetos) return crearGeoJson(featureCampus);

    const features = [
      ...featureCampus,
      ...crearFeaturesDesdeObjetos(objetos as Objeto[]),
    ];

    return crearGeoJson(features);
  }, [featureCampus, objetos]);

  const handleObjetoClick = useCallback(
    (objeto: Objeto, geometria: Geometria) => {
      setObjetoSeleccionado({ ...objeto, geometria });
      abrirSwipeableObjeto();
      centrarMapaAObjeto(objeto);
      setBusqueda('');
    },
    [
      setObjetoSeleccionado,
      abrirSwipeableObjeto,
      centrarMapaAObjeto,
      setBusqueda,
    ]
  );

  const handleCategoriaClick = useCallback(
    ({ _id }: Categoria) => {
      setCategoria((prev) => (prev === _id ? '' : _id));
    },
    [setCategoria]
  );

  const styleFunction: StyleFunction = (feature) => {
    if (!feature) return {};

    const { _id, style, categoria } = feature.properties as Objeto;

    if (!objetosEnCapaPorId.has(_id) && _id !== campus?._id) {
      return {
        color: 'transparent',
        fillColor: 'transparent',
        fillOpacity: 0,
      };
    }

    if (style) return style;

    const { color, colorSecundario } = categoriasPorId.get(categoria._id)!;

    return {
      color: colorSecundario,
      fillColor: color,
      fillOpacity: 0.6,
    };
  };

  const onEachFeature = useCallback(
    (feature: any, layer: any) => {
      const { onClick, _id } = feature.properties as Objeto;

      if (onClick) {
        layer.on('click', () => {
          onClick();
        });
        return;
      }

      if (!objetosEnCapaPorId.has(_id)) return;

      layer.on('click', () => {
        handleObjetoClick(feature.properties as Objeto, feature.geometry);
      });
    },
    [handleObjetoClick, objetosEnCapaPorId]
  );

  const handleSeleccionBusqueda = useCallback(
    (item: ItemBusqueda | null) => {
      if (item?.tipo === 'objeto') {
        const objeto = objetosPorId.get(item._id);
        if (objeto) {
          setObjetoSeleccionado(objeto);
          centrarMapaAObjeto(objeto);
        }
      }
      seleccionarItemBusqueda(item);
    },
    [
      centrarMapaAObjeto,
      objetosPorId,
      seleccionarItemBusqueda,
      setObjetoSeleccionado,
    ]
  );

  const handleObjetoSeleccionadoSwipeable = useCallback(
    (id: string) => {
      const objeto = objetosPorId.get(id)!;
      handleObjetoClick(objeto, objeto.geometria);
    },
    [handleObjetoClick, objetosPorId]
  );

  const handleAvatarClick = useCallback(() => {
    if (!user) {
      return setUserModalOpen(true);
    }
    abrirSwipeable(SwipeableTypes.Usuario, null);
  }, [user, setUserModalOpen, abrirSwipeable]);

  return (
    <>
      <UserModal />
      <Swipeable onObjetoSeleccionado={handleObjetoSeleccionadoSwipeable} />
      <Box sx={{ width: '100vw', height: '100svh', position: 'relative' }}>
        {campus && centro && (
          <Mapa
            center={centro}
            geojson={geojson}
            onClick={handleObjetoClick}
            onEachFeature={onEachFeature}
            styleFunction={styleFunction}
            marcadores={objetosEnCapa}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              zIndex: 0,
            }}
          >
            <UserMarker />
          </Mapa>
        )}
        <Container>
          <Stack py={2} gap={3}>
            <Stack direction="row" width="100%" gap={2} alignItems="center" justifyContent="space-between"> 
              <SearchField
                onChange={handleSeleccionBusqueda}
              />
              <Avatar
                id="avatar"
                sx={{ cursor: 'pointer' }}
                onClick={handleAvatarClick}
              />
            </Stack>
            <Categorias
              categorias={categorias as Categoria[]}
              value={categoria}
              onChange={handleCategoriaClick}
            />
            <ControlesObjeto onClose={cerrarObjeto} />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

export default Home;
