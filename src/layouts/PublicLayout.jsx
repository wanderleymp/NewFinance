import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const PublicLayout = ({ children }) => {
  const theme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: 'transparent'
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            padding: 0,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            backgroundAttachment: 'fixed'
          }
        }
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'transparent'
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
};

export default PublicLayout;
