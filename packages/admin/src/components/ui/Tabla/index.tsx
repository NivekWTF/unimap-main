 
import { FC, memo, JSX } from 'react';

import MuiTable from '@mui/material/Table';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';

import { SxProps } from '@mui/material';

export interface Cabeceros<T=any> {
  key?: keyof T;
  label: string;
  transform?: (row: T) => string | Element | JSX.Element;
  sx?: SxProps;
  align?: 'left' | 'right' | 'center' | 'inherit' | 'justify';
}

interface TableProps {
  cabeceros?: Cabeceros<any>[];
  rows?: any[];
  isLoading?: boolean;
  tableContainerSx?: SxProps;
}

const Table: FC<TableProps> = ({ cabeceros, rows, isLoading, tableContainerSx }) => {
  return (
    <TableContainer sx={tableContainerSx}>
      <MuiTable sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {cabeceros!.map((cabecero, index) => (
              <TableCell
                key={index}
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
                align="center"
              >
                {cabecero.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ minHeight: 420 }}>
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={cabeceros?.length}
                sx={{ border: 'none', paddingTop: 0 }}
              >
                <LinearProgress />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && rows!.map((row, index) => (
            <TableRow
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {cabeceros!.map((cabecero, index) => (
                <TableCell
                  key={index}
                  component="th"
                  scope="row"
                  align="center"
                  sx={cabecero.sx || { padding: 1 }}
                >
                  <Fade in>
                    <Box>
                      {cabecero.transform
                        ? (cabecero.transform(row) || 'N / A')
                        : (row[cabecero.key!] || 'N / A')}
                    </Box>
                  </Fade>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
      {!isLoading && !rows?.length && (
        <Fade in>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              minHeight: '50svh',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h5">Sin registros</Typography>
          </Box>
        </Fade>
      )}
    </TableContainer>
  );
};

Table.defaultProps = {
  cabeceros: [],
  rows: [],
  tableContainerSx: { overflowY: 'hidden', minHeight: '50svh', gridColumn: 'span 3' },
};

const TableMemo = memo(Table);

export default TableMemo;
