import React from 'react';
import { Typography, Box } from '@mui/material';
import packageJson from '../../package.json';

export const AppVersion = () => {
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
        v{packageJson.version}
      </Typography>
    </Box>
  );
};
