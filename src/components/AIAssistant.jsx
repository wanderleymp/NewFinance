import React, { useState, useEffect } from 'react';
import { 
  Fab, 
  Tooltip,
  Box
} from '@mui/material';
import { 
  Chat as ChatIcon 
} from '@mui/icons-material';
import AIChat from './AIChat';

const AIAssistant = ({ 
  disableFloatingChat = false,  // Nova prop para desabilitar
  currentRoute 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    if (!disableFloatingChat) {
      setIsChatOpen(!isChatOpen);
    }
  };

  // Efeito para fechar chat em rotas específicas
  useEffect(() => {
    if (disableFloatingChat) {
      setIsChatOpen(false);
    }
  }, [disableFloatingChat]);

  // Renderização condicional baseada na prop
  if (disableFloatingChat) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 1000 
      }}
    >
      <Tooltip title="Assistente de IA">
        <Fab 
          color="primary" 
          onClick={toggleChat}
          sx={{ 
            boxShadow: 3,
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>

      {isChatOpen && (
        <AIChat 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
    </Box>
  );
};

export default AIAssistant;
