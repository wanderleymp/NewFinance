import React from 'react';
import { Typography, Box } from '@mui/material';
import packageJson from '../../package.json';

export const AppVersion = () => {
  const apiHost = import.meta.env.VITE_API_URL || 'Não configurado';

  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        bottom: 10, 
        left: 10,
        opacity: 0.6,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5
      }}
    >
      <Typography variant="caption" color="text.secondary">
        v{packageJson.version} | {apiHost.replace(/^https?:\/\//, '')}
      </Typography>
    </Box>
  );
};
