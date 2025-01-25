import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Carregando...' }: LoadingProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%', 
        padding: 2 
      }}
    >
      <CircularProgress />
      <Typography variant="body1" sx={{ marginTop: 2 }}>
        {message}
      </Typography>
    </Box>
  );
}
