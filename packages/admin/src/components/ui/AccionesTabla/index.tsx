import { FC, useCallback, useState } from "react";

import { Edit, Delete, Visibility } from "@mui/icons-material";
import { Stack, IconButton } from "@mui/material";

import DialogoConfirmacion from "../../shared/DialogoConfirmacion";

type AccionesTablaProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onDetail?: () => void;
};

const AccionesTabla: FC<AccionesTablaProps> = ({ onEdit, onDelete, onDetail }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleAbrirConfirmacion = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleConfirmacion = useCallback((confirmado: boolean) => {
    setIsModalOpen(false);
    if (!confirmado) {
      return;
    }
    if (onDelete) onDelete();
  }, [onDelete]);

  return (
    <>
      <DialogoConfirmacion open={isModalOpen} onClose={handleConfirmacion} />
      <Stack direction="row" spacing={1} justifyContent="center">
        {!!onEdit && <IconButton onClick={onEdit}>
          <Edit />
        </IconButton>}
        {!!onDetail && <IconButton onClick={onDetail}>
          <Visibility />
        </IconButton>}
        {!!onDelete && <IconButton onClick={handleAbrirConfirmacion}>
          <Delete />
        </IconButton>}
      </Stack>
    </>
  );
};

export default AccionesTabla;
