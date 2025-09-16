import { FC, ReactNode } from 'react';

import { Box, IconButton, Stack, Typography } from '@mui/material';

import { Delete } from '@mui/icons-material';

import FileExtension from '../FileExtension';

type FileRowProps = {
  file: File;
  onFileRemoved: () => void;
  action?: ReactNode;
};

const FileRow: FC<FileRowProps> = ({ file, onFileRemoved, action }) => {
  const { name, size } = file;

  const sizeInMB = (size / 1000 / 1000).toFixed(2);

  return (
    <Stack direction="row" width="100%" gap={2} justifyContent="flex-start">
      <FileExtension fileName={name} />
      <Stack flexGrow={1}>
        <Typography
          maxWidth={'100%'}
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          fontWeight="bold"
          variant="caption"
        >
          {name}
        </Typography>
        <Typography variant="caption" whiteSpace="nowrap">Tamaño: {sizeInMB} MB</Typography>
      </Stack>
      {action}
      <Box alignSelf="flex-start">
        <IconButton onClick={onFileRemoved}>
          <Delete color="error" />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default FileRow;
