import { FC, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Formulario from '../../../../containers/Formulario';
import FormField from '../../../../components/forms/FormField';
import CargaAcademica, { Carga } from '../../components/CargaAcademica';

import api from '@api';
import useAlert from '../../../../hooks/useAlert';
import { Formularios } from '../../../../constant/mensajes';
import { Box, Button } from '@mui/material';

const formulario = z.object({
  _id: z.string().optional(),
  nombres: z.string().min(1, Formularios.required),
  apellidos: z.string().min(1, Formularios.required),
  correo: z.string().min(1, Formularios.required).email(Formularios.email),
  clave: z.string().min(1, Formularios.required),
});

type TAlumno = z.infer<typeof formulario>

const AlumnosFormulario: FC = () => {
  const alert = useAlert();

  const form = useForm<TAlumno>({
    resolver: zodResolver(formulario)
  });

  const { id } = useParams() as { id: string };

  const { data: alumno } = api.usuarios.obtenerPorId.useQuery({ id }, { enabled: !!id });

  const { mutate: mutReiniciarPassword, isLoading } = api.usuarios.reiniciarPassword.useMutation({
    onSuccess: () => {
      alert({
        message: 'Se ha reiniciado la contraseña y notificado al usuario correctamente',
        type: 'success',
      });
    },
    onError: ({
      message,
    }) => {
      alert({ message, type: 'error' });
    }
  });

  const handleRegresar = useCallback(() => {
    window.history.back();
  }, []);

  const handleReiniciarPassword = useCallback(() => {
    mutReiniciarPassword({ id });
  }, [id, mutReiniciarPassword]);
 
  useEffect(() => {
    if (!alumno) return;
    form.reset(alumno);
  }, [alumno, form]);

  return (
    <Formulario 
      title="Alumnos" 
      form={form} 
      onCancel={handleRegresar}
      hideGuardar
      action={
        <Button onClick={handleReiniciarPassword} disabled={isLoading}>
          Reinicar contraseña
        </Button>
      }
    > 
      <FormField name="nombres" label="Nombre" disabled />
      <FormField name="apellidos" label="Apellidos" disabled />
      <FormField name="clave" label="Clave" disabled />
      <FormField name="correo" label="Correo" disabled />
      <Box gridColumn="span 2">
        <CargaAcademica carga={alumno?.cargaAcademica as Carga[]}  />
      </Box>
    </Formulario>
  );
}

export default AlumnosFormulario;