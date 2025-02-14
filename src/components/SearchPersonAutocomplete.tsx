import React, { useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { personService } from '../services/personService';

interface SearchPersonAutocompleteProps {
  onPersonSelect: (person: any | null) => void;
  label?: string;
  placeholder?: string;
}

export function SearchPersonAutocomplete({
  onPersonSelect,
  label = 'Buscar Pessoa',
  placeholder = 'Digite nome ou documento'
}: SearchPersonAutocompleteProps) {
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  useEffect(() => {
    console.log('🔍 SearchPersonAutocomplete - Estado inicial', {
      options,
      loading,
      inputValue
    });
  }, [options, loading, inputValue]);

  const searchPeople = React.useCallback(async (query: string) => {
    if (query.length < 2) {
      console.log('🚫 Busca muito curta, ignorando', { query });
      return;
    }

    try {
      console.log('🔎 Iniciando busca de pessoas', { query });
      setLoading(true);
      
      const response = await personService.search(query);
      
      console.log('📋 Resposta da busca de pessoas:', response);
      const processedResults = response.items || [];
      
      console.log('📊 Resultados de pessoas processados:', processedResults);
      setOptions(processedResults);
    } catch (error) {
      console.error('❌ Erro ao buscar pessoas:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePersonChange = (
    _event: React.SyntheticEvent, 
    newValue: any | null
  ) => {
    console.log('👤 Mudança no campo pessoa:', { newValue });
    onPersonSelect(newValue);
  };

  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    console.log('✏️ Mudança no input:', { newInputValue });
    setInputValue(newInputValue);
    
    if (newInputValue.length >= 2) {
      searchPeople(newInputValue);
    }
  };

  return (
    <Autocomplete
      inputValue={inputValue}
      options={options}
      loading={loading}
      onInputChange={handleInputChange}
      getOptionLabel={(option) => option.name || ''}
      onChange={handlePersonChange}
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
      noOptionsText="Nenhuma pessoa encontrada"
      loadingText="Carregando..."
    />
  );
}
