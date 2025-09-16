import { FC, useMemo } from 'react';

import { Box, Typography } from '@mui/material';

type FileExtensionProps = {
  fileName: string;
};

const FileExtension: FC<FileExtensionProps> = ({ fileName }) => {
  const fileExtension = useMemo(
    () => `.${fileName.split('.').at(-1)}`,
    [fileName]
  );

  return (
    <Box
      p={2}
      borderRadius={2}
      color="common.white"
      minWidth={50}
      sx={{
        backgroundColor: 'grey.500',
        display: 'flex',
        justifyContent: 'center',
        flexBasis: 80,
        height: 25
      }}
    >
      <Typography fontWeight="bold" textTransform="uppercase">
        {fileExtension}
      </Typography>
    </Box>
  );
};

export default FileExtension;
