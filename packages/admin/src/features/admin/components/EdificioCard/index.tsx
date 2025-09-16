import { FC } from "react";

import { Edit, Delete } from "@mui/icons-material";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Skeleton,
  Stack,
} from "@mui/material";

type TarjetaProps = {
  loading?: boolean;
};

const Tarjeta: FC<TarjetaProps> = ({ loading  }) => {
  if (loading) {
    return (
      <Card variant="outlined" >
        <CardMedia component="div">
          <Skeleton height={240} width="110%" sx={{ translate: '0px -60px'}} />
        </CardMedia>
        <CardContent sx={{ translate: '0px -130px', height: 20 }}>
          <Stack pt={3} gap={1}>
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={20} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardMedia
        component="img"
        alt="Image de edificio"
        height="140"
        image="https://www.uas.edu.mx/multimedia/carrusel/carrusel_0.53768000%201633711007.jpeg"
      />
      <CardContent>
        <Typography variant="h6">Edificio A</Typography>
        <Typography variant="caption">
          Edificio del área de computación
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton>
          <Edit />
        </IconButton>
        <IconButton>
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default Tarjeta;
