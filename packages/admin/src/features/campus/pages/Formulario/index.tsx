import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Stack, Typography } from "@mui/material";
import { AttachFile } from "@mui/icons-material";

import FormField from "../../../../components/forms/FormField";
import Formulario from "../../../../containers/Formulario";
import FormFile from "../../../../components/forms/FormFile";
import Map from '../../../../components/ui/Map'

import api from "@api";
import useAlert from "../../../../hooks/useAlert";
import { GeoJSON } from '../../../../utils/types';
import { ARCHIVO_GEOJSON_INVALIDO, Alertas, Formularios } from "../../../../constant/mensajes";
import { crearGeoJsonDesdeGeometria, validarArchivoGeoJson } from "../../../../utils/functions";
import { poligonoSchema } from "../../../../utils/validators";

const dominio = import.meta.env.VITE_DOMINIO;

const formularioSchema = z.object({
  _id: z.string().optional(),
  nombre: z.string().min(1, Formularios.required),
  clave: z.string().min(1, Formularios.required),
  subdominio: z.string().min(1, Formularios.required),
  descripcion: z.string(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().optional(),
  web: z.string().optional(),
  archivoGeojson: z.any(),
  geometria: poligonoSchema.optional(),
}).refine(
  ({ _id, archivoGeojson }) => {
    if (_id) return true;
    return archivoGeojson && archivoGeojson instanceof File;
  },
  {
    message: Formularios.required,
    path: ['archivoGeojson'],
  }
);

const CampusFormulario: FC = () => {
  const setAlert = useAlert();
  const navigate = useNavigate();

  const { id } = useParams();

  const [geojsonKey, setGeojsonKey] = useState<string>('');
  const [geojson, setGeojson] = useState<GeoJSON | null>(null);

  const form = useForm({
    resolver: zodResolver(formularioSchema),
  });

  const archivoGeoJson: File = form.watch('archivoGeojson');
  const subdominio: string = form.watch("subdominio");

  const url = useMemo(() => `https://${subdominio}.${dominio}`, [subdominio]);

  const { mutate: guardar, isLoading } = api.campus.guardar.useMutation({
    onSuccess: () => {
      navigate("/campus");
      setAlert({ message: Alertas.guardado, type: "success" });
    },
  });

  const { data: campus } = api.campus.obtenerPorId.useQuery(
    {
      id: id!,
    },
    {
      enabled: !!id,
    }
  );

  const validarGeoJson = useCallback(async () => {
    if (!archivoGeoJson) return;

    const resultado = await validarArchivoGeoJson(archivoGeoJson);
    if (!resultado.success) {
      form.setError('archivoGeojson', {
        type: 'manual',
        message: ARCHIVO_GEOJSON_INVALIDO,
      });
      return;
    }

    form.clearErrors('archivoGeojson');
    const { data } = resultado;

    form.setValue('geometria', data.features[0].geometry);
    setGeojsonKey(archivoGeoJson.name);
    setGeojson(data);
  }, [archivoGeoJson, form]);

  const handleRegresar = useCallback(() => {
    navigate("/campus");
  }, [navigate]);

  useEffect(() => {
    validarGeoJson();
  }, [validarGeoJson]);

  useEffect(() => {
    if (campus) {
      form.reset(campus);
      
      if (!campus.geometria) return;
      const geojson = crearGeoJsonDesdeGeometria(campus.geometria);
      setGeojsonKey(campus._id);
      setGeojson(geojson);
    }
  }, [form, campus]);

  return (
    <Formulario
      title="Campus"
      form={form}
      onSubmit={guardar}
      onCancel={handleRegresar}
      isLoading={isLoading}
    >
      <FormField name="nombre" label="Nombre" />
      <FormField name="clave" label="Clave" />
      <FormField
        name="descripcion"
        label="Descripción"
        rows={3}
        sx={{ gridColumn: "span 2 " }}
        multiline
      />
      <Typography variant="h6" color="info.main" gridColumn="span 2">
        Detalles del sitio
      </Typography>
      <FormField name="subdominio" label="Subdomio" />
      <FormField
        name="url"
        label="URL"
        value={subdominio ? url : ""}
        InputProps={{ readOnly: true }}
      />
      <Typography variant="h6" color="info.main" gridColumn="span 2">
        Detalles de la institución
      </Typography>
      <FormField name="direccion" label="Dirección" />
      <FormField name="telefono" label="Teléfono" />
      <FormField name="email" label="Correo electrónico" />
      <FormField name="web" label="Sitio web" />
      <Typography variant="h6" color="info.main" gridColumn="span 2">
        Detalles geográficos
      </Typography>
      <FormFile
        name="archivoGeojson"
        label="Archivo GeoJSON"
        inputProps={{ accept: "application/json,.geojson" }}
        InputProps={{ startAdornment: <AttachFile /> }}
      />
      <Stack gap={1} gridColumn="span 2">
        <Map
          style={{ height: 320 }}
          geojson={geojson!}
          geojsonKey={geojsonKey}
        />
      </Stack>
    </Formulario>
  );
};

export default CampusFormulario;
