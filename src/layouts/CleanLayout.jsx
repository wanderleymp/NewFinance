import React from 'react';
import { Box } from '@mui/material';

const CleanLayout = ({ children }) => {
  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: 0,
        '& *': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0
        }
      }}
    >
      {children}
    </Box>
  );
};

export default CleanLayout;
