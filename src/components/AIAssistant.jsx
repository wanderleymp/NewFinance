import React, { useState } from 'react';
import { 
  Fab 
} from '@mui/material';
import { 
  RocketLaunch as AIIcon 
} from '@mui/icons-material';
import { AIChat } from './AIChat';

export const AIAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <Fab 
        color="primary" 
        onClick={toggleChat}
        sx={{ 
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          boxShadow: '0 10px 25px rgba(37, 117, 252, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 15px 35px rgba(37, 117, 252, 0.4)',
          },
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(0.95)',
              boxShadow: '0 0 0 0 rgba(37, 117, 252, 0.7)',
            },
            '70%': {
              transform: 'scale(1)',
              boxShadow: '0 0 0 20px rgba(37, 117, 252, 0)',
            },
            '100%': {
              transform: 'scale(0.95)',
              boxShadow: '0 0 0 0 rgba(37, 117, 252, 0)',
            },
          },
          '&:not(:hover)': {
            animation: 'pulse 2s infinite',
          },
        }}
      >
        <AIIcon />
      </Fab>

      {isChatOpen && (
        <AIChat onClose={() => setIsChatOpen(false)} />
      )}
    </>
  );
};
