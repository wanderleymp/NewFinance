import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { contactsService } from '../../services/contactsService';

// Componentes estilizados
const SearchBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: '#ffffff',
}));

const SearchInput = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 2),
  borderRadius: 8,
  backgroundColor: '#f0f2f5',
  '&:hover': {
    backgroundColor: '#e9edef',
  },
}));

const ContactSearch = ({ onContactSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // Efeito para buscar contatos quando o termo de busca mudar
  useEffect(() => {
    const searchContacts = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        setError(null);
        return;
      }
      
      try {
        setIsSearching(true);
        setError(null);
        console.log('Buscando contatos com termo:', searchTerm);
        
        // Usando o método searchAllContacts do serviço de contatos
        const results = await contactsService.searchAllContacts({
          search: searchTerm,
          includeNoChat: true,
          limit: 10
        });
        
        console.log('Resultados da busca:', results);
        
        // Verifica se há um erro na resposta
        if (results.error) {
          // Se houver erro mas também tiver resultados (mockados), exibe os resultados com aviso
          if (results.items && results.items.length > 0) {
            setSearchResults(results.items || []);
            setError({
              message: `Usando resultados locais devido a um erro de conexão: ${results.error.message || 'Erro desconhecido'}`,
              status: results.error.status,
              type: 'warning'
            });
          } else {
            setError({
              message: `Erro ao buscar contatos: ${results.error.message || 'Erro desconhecido'}`,
              status: results.error.status,
              type: 'error'
            });
            setSearchResults([]);
          }
        } else {
          setSearchResults(results.items || []);
          
          // Se não houver resultados, exibe uma mensagem
          if (results.items.length === 0) {
            setError({
              message: `Nenhum contato encontrado para "${searchTerm}"`,
              type: 'info'
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        setError({
          message: `Erro ao buscar contatos: ${error.message || 'Erro desconhecido'}`,
          status: error.response?.status,
          type: 'error'
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    // Debounce para a busca
    const timeoutId = setTimeout(() => {
      searchContacts();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
  };

  const handleRetrySearch = () => {
    // Força uma nova busca usando o mesmo termo
    const currentTerm = searchTerm;
    setSearchTerm('');
    setTimeout(() => setSearchTerm(currentTerm), 10);
  };

  const handleContactClick = (contact) => {
    if (onContactSelect) {
      onContactSelect(contact);
      handleClearSearch();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <SearchBar>
        <SearchInput>
          <SearchIcon sx={{ color: '#54656f', mr: 1 }} />
          <InputBase
            fullWidth
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ ml: 1 }}
          />
          {searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm('')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </SearchInput>
      </SearchBar>

      {isSearching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert 
          severity={error.type || 'error'} 
          sx={{ 
            m: 1, 
            fontSize: '0.8rem',
            '& .MuiAlert-message': { 
              display: 'flex', 
              alignItems: 'center' 
            } 
          }}
          action={
            error.type === 'error' && (
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  setSearchTerm(searchTerm);
                  setError(null);
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )
          }
        >
          {error.message}
        </Alert>
      )}

      {searchResults.length > 0 && (
        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
          {searchResults.map((contact) => (
            <React.Fragment key={contact.id}>
              <ListItem 
                button 
                onClick={() => onContactSelect(contact)}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f0f2f5',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    alt={contact.name} 
                    src={contact.avatar || ''}
                    sx={{ 
                      bgcolor: contact.hasChatHistory ? '#128C7E' : '#9e9e9e',
                      width: 40,
                      height: 40
                    }}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {contact.name}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {contact.value}
                      {contact.hasChatHistory && (
                        <Box 
                          component="span" 
                          sx={{ 
                            ml: 1, 
                            fontSize: '0.7rem', 
                            color: 'success.main',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          • Chat existente
                        </Box>
                      )}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      {!isSearching && searchTerm.length >= 2 && searchResults.length === 0 && !error && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Nenhum contato encontrado para "{searchTerm}"
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ContactSearch;
