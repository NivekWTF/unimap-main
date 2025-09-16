import {
  ChangeEventHandler,
  Dispatch,
  DragEventHandler,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useRef,
} from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Stack, Typography } from '@mui/material';

import FileRow from './components/FileRow';
import useAlert from '../../../hooks/useAlert';
import { MAXIMO_ARCHIVOS } from '../../../constant/mensajes';

type FileDragAndDropProps = {
  value: File[];
  onChange: Dispatch<SetStateAction<File[]>>;
  onDeleted?: (file: File, index: number) => void; 
  fileAction?: (file: File, index: number) => ReactNode
  accept?: string;
  validate?: (file: File) => Promise<boolean> | boolean;
  disabled?: boolean;
  maxFiles?: number;
};

const FileDragAndDrop: FC<FileDragAndDropProps> = ({
  accept,
  onChange,
  onDeleted,
  value,
  validate,
  disabled,
  fileAction,
  maxFiles,
}) => {
  const setAlert = useAlert();

  const fileInput = useRef<HTMLInputElement | null>(null);

  const filesNumber = value.length;

  const openFile = useCallback(() => {
    fileInput.current?.click();
  }, []);

  const dropHandler: DragEventHandler<HTMLDivElement> = useCallback(
    (ev) => {
      ev.preventDefault();

      if (maxFiles && filesNumber >= maxFiles) {
        setAlert({
          message: MAXIMO_ARCHIVOS(maxFiles),
          type: 'warning',
        });
        return;
      }
      const { dataTransfer } = ev;
      let files: File[];

      if (dataTransfer.items) {
        files = [...dataTransfer.items].flatMap((item) => {
          if (item.kind !== 'file') return [];
          const file = item.getAsFile();
          return file;
        }) as File[];
      } else {
        files = [...dataTransfer.files];
      }

      onChange((prev) => [...prev, ...files]);
    },
    [onChange, setAlert, maxFiles, filesNumber]
  );

  const dragOverHandler: DragEventHandler<HTMLDivElement> = useCallback(
    (ev) => {
      ev.preventDefault();
    },
    []
  );

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> =
    useCallback(
      async ({ target }) => {
        if (maxFiles && filesNumber >= maxFiles) {
          setAlert({
            message: MAXIMO_ARCHIVOS(maxFiles),
            type: 'warning',
          });
          return;
        }

        const { files } = target;
        if (!files || !files.length) return;
        const file = files[0];
        if (validate && !(await validate(file))) return;
        onChange((prev) => [...prev, file]);
        fileInput.current!.value = '';
      },
      [onChange, validate, maxFiles, filesNumber, setAlert]
    );

  const handleFileRemoved = useCallback(
    (index: number) => {
      return () => {
        onDeleted && onDeleted(value[index], index);
        onChange((prev) => prev.filter((_, i) => index !== i));
      };
    },
    [onChange, onDeleted, value]
  );

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{ cursor: 'pointer' }}
      onDragOver={dragOverHandler}
      onDrop={dropHandler}
    >
      <input
        ref={fileInput}
        accept={accept}
        onChange={handleFileInputChange}
        type="file"
        style={{ visibility: 'collapse' }}
        disabled={disabled}
      />
      <Button
        variant="outlined"
        onClick={openFile}
        sx={{ borderRadius: 1, padding: 4 }}
        disabled={disabled}
      >
        <Stack alignItems="center" gap={2}>
          <CloudUploadIcon color="primary" fontSize="large" />
          <Typography>
            Suelta aquí tus archivos o da clic aquí para subirlos
          </Typography>
        </Stack>
      </Button>
      <Stack pt={2} rowGap={1} justifyContent="flex-start">
        {value.map((file, index) => (
          <FileRow
            key={file.name}
            file={file}
            onFileRemoved={handleFileRemoved(index)}
            action={fileAction && fileAction(file, index)}
          />
        ))}
      </Stack>
    </Stack>
  );
};

FileDragAndDrop.defaultProps = {
  value: [],
};

export default FileDragAndDrop;
