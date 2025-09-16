import { FC, useCallback, useEffect, useRef, useState } from 'react';

import ReactCrop, { type Crop } from 'react-image-crop';
import { Button, Dialog, IconButton, Stack } from '@mui/material';

import FileDragAndDrop from '../../../../components/forms/FileDragAndDrop';
import { readImage, recortarImagen } from '../../../../utils/functions';
import { Close } from '@mui/icons-material';

type ModalFotografiaProps = {
  open: boolean;
  onAgregar: (src: string, newFile: File) => void;
  onClose?: () => void;
};

const ModalFotografia: FC<ModalFotografiaProps> = ({
  open,
  onAgregar,
  onClose,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [crop, setCrop] = useState<Crop>();
  const [files, setFiles] = useState<File[]>([]);
  const [imageSrc, setImageSrc] = useState<string>();

  const leerImagen = useCallback(async () => {
    const [file] = files;
    if (!file) return;
    const src = await readImage(file);
    setImageSrc(src);
  }, [files]);

  const handleAgregarClick = useCallback(async () => {
    const [file] = files;
    const { src, file: newFile } = await recortarImagen({
      image: imgRef.current!, 
      crop: crop!,
      filename: file.name,
    });
    onAgregar(src, newFile);
    setFiles([]);
    setImageSrc('');
  }, [crop, onAgregar, files]);

  const handleImageLoad = useCallback(() => {
    const { width, height } = imgRef.current!;
    setCrop({ x: 0, y: 0, width, height, unit: 'px' });
  }, []);

  const handleClose = useCallback(() => {
    setFiles([]);
    setTimeout(() => setImageSrc(''), 300);
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    leerImagen();
  }, [leerImagen]);

  return (
    <Dialog open={open}>
      <Stack width="100%" direction="row-reverse">
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </Stack>
      <Stack px={2} gap={2}>
        {!imageSrc && (
          <FileDragAndDrop accept="image/*" value={files} onChange={setFiles} />
        )}
        {!!imageSrc && (
          <Stack pb={2} gap={2}>
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
              <img ref={imgRef} src={imageSrc} onLoad={handleImageLoad} />
            </ReactCrop>
            <Button onClick={handleAgregarClick} sx={{ alignSelf: 'center' }}>
              Agregar
            </Button>
          </Stack>
        )}
      </Stack>
    </Dialog>
  );
};

export default ModalFotografia;
