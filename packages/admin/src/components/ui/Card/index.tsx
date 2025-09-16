import { FC, useCallback, useState } from "react";

import { Edit, Delete } from "@mui/icons-material";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
} from "@mui/material";

import DialogoConfirmacion from "../../shared/DialogoConfirmacion";

type TarjetaProps = {
  img?: string;
  titulo: string;
  descripcion?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

const Tarjeta: FC<TarjetaProps> = ({
  descripcion,
  titulo,
  img,
  onDelete,
  onEdit,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleAbrirConfirmacion = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleConfirmacion = useCallback(
    (confirmado: boolean) => {
      if (!confirmado) {
        setIsModalOpen(false);
        return;
      }
      if (onDelete) onDelete();
    },
    [onDelete]
  );

  return (
    <>
      <DialogoConfirmacion open={isModalOpen} onClose={handleConfirmacion} />
      <Card
        elevation={1}
        sx={{
          "@keyframes fadein": {
            from: { opacity: 0, translate: "0 20px" },
            to: { opacity: 1, translate: 0 },
          },
          animation: "fadein 0.5s",
          height: 260,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {img && <CardMedia component="img" height="120" src={img} />}
        <CardContent>
          <Typography
            variant="h6"
            color="primary.main"
            fontWeight={600}
            maxWidth="100%"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {titulo}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              maxHeight: "1rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {descripcion}
          </Typography>
        </CardContent>
        <CardActions
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <IconButton onClick={onEdit} sx={{ alignSelf: 'flex-end' }}>
            <Edit />
          </IconButton>
          <IconButton onClick={handleAbrirConfirmacion} sx={{ alignSelf: 'flex-end' }}>
            <Delete />
          </IconButton>
        </CardActions>
      </Card>
    </>
  );
};

Tarjeta.defaultProps = {
  img: "",
  titulo: "Titulo",
  descripcion: "Descripcion",
  onEdit: () => {},
  onDelete: () => {},
};

export default Tarjeta;
