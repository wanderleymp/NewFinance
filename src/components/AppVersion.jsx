import React from 'react';
import { Typography, Box } from '@mui/material';
import packageJson from '../../package.json';

export const AppVersion = () => {
  const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const environment = apiHost.includes('localhost') ? 'local' : 
                     apiHost.includes('dev.') ? 'dev' : 
                     apiHost.includes('staging.') ? 'staging' : 'prod';

  // Remove protocolo e path, deixa só o host
  const displayHost = apiHost.replace(/^https?:\/\//, '').split('/')[0];

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
        v{packageJson.version} | {displayHost} ({environment})
      </Typography>
    </Box>
  );
};
