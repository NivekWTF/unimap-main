import { FC } from "react";

import {
  ImageListItem,
  ImageList as MuiImageList,
  Card,
  Stack,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

type ImageListProps = {
  images: string[];
  onDelete: (index: number) => void;
};

const ImageList: FC<ImageListProps> = ({ images, onDelete }) => {
  return (
    <MuiImageList cols={3} rowHeight={200} gap={16}>
      {images.map((image, index) => (
        <ImageListItem key={image}>
          <Card sx={{ width: 260 }} variant="outlined">
            <Stack alignItems="center" position="relative">
              <img
                src={image}
                alt={`imagen-${index}`}
                style={{ objectFit: "contain", height: "200px" }}
              />
              <IconButton
                onClick={() => onDelete(index)}
                sx={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
              >
                <Delete color="error" />
              </IconButton>
            </Stack>
          </Card>
        </ImageListItem>
      ))}
    </MuiImageList>
  );
};

export default ImageList;
