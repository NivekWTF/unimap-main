import { useState, FC, SyntheticEvent, useCallback, useRef } from 'react';

import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import useStore from '../../../../store';
import useBusqueda from '../../../../hooks/useBusqueda';

export type ItemBusqueda = {
  _id: string;
  nombre: string;
  tipo: 'servicio' | 'objeto' | 'clase';
  agrupador: string;
};

type SearchFieldProps = {
  onChange?: (selected: ItemBusqueda) => void;
};

const SearchField: FC<SearchFieldProps> = ({ onChange }) => {
  const campusId = useStore(({ campusId }) => campusId);

  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    handleChange: handleBusquedaChange,
    resultadoBusqueda,
    isLoading,
    query,
  } = useBusqueda(campusId);

  const handleChange = useCallback(
    (_: SyntheticEvent, value: ItemBusqueda) => {
      inputRef.current?.blur();
      console.log('onChange', value);
      if (onChange) onChange(value);
    },
    [onChange]
  );

  return (
    <Autocomplete
      id="searchField"
      loading={isLoading && !!query}
      loadingText="Buscando..."
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      noOptionsText={
        query ? 'No se encontraron resultados' : 'Empieza a buscar...'
      }
      options={resultadoBusqueda || []}
      filterOptions={(options) => options}
      // @ts-expect-error - Item can never string
      onChange={handleChange}
      renderGroup={({ key, children, group }) => (
        <Stack key={key} alignItems="stretch" pt={2}>
          <Typography variant="body1" color="primary" pl={2}>
            {group}
          </Typography>
          {children}
        </Stack>
      )}
      blurOnSelect
      groupBy={(option) => option.agrupador}
      getOptionLabel={(option) => option.nombre}
      onInputChange={(_, value, reason) =>
        reason === 'input' && handleBusquedaChange(value)
      }
      fullWidth
      renderInput={(params) => (
        <Stack width="100%">
          <TextField
            {...params}
            id="searchField"
            placeholder="Busca aquí"
            InputProps={{
              ...params.InputProps,
              sx: { borderRadius: 4, backgroundColor: 'common.white' },
            }}
          />
        </Stack>
      )}
    />
  );
};

SearchField.defaultProps = {
  onChange: () => {},
};

export default SearchField;
