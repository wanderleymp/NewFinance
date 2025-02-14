import React from 'react';
import { Box } from '@mui/material';

const BaseLayout = ({ children }) => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {children}
    </Box>
  );
};

export default BaseLayout;
