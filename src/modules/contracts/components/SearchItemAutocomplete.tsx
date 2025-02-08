import React, { useState, useCallback } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { debounce } from 'lodash';

interface SearchItemAutocompleteProps {
  searchService: (query: string) => Promise<any>;
  getOptionLabel: (option: any) => string;
  onItemSelect: (item: any | null) => void;
  label?: string;
  placeholder?: string;
}

export function SearchItemAutocomplete({
  searchService,
  getOptionLabel,
  onItemSelect,
  label = 'Buscar Item',
  placeholder = 'Digite para buscar'
}: SearchItemAutocompleteProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchItems = useCallback(
    debounce(async (query) => {
      try {
        console.log('Iniciando busca de itens com query:', query);
        setLoading(true);
        const response = await searchService(query);
        console.log('Resposta da busca de itens:', response);
        setOptions(response.items || []);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [searchService]
  );

  return (
    <Autocomplete
      options={options}
      loading={loading}
      onInputChange={(_, newInputValue) => {
        if (newInputValue.length >= 2) {
          searchItems(newInputValue);
        }
      }}
      getOptionLabel={getOptionLabel}
      onChange={(_, newValue) => onItemSelect(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      noOptionsText="Nenhum item encontrado"
      loadingText="Carregando..."
    />
  );
}
