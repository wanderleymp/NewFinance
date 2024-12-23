import { Box, Typography, useTheme } from '@mui/material';
import { AttachMoney } from '@mui/icons-material';

const Logo = ({ size = 'medium' }) => {
  const theme = useTheme();
  
  const sizes = {
    small: { icon: 24, text: 'subtitle1' },
    medium: { icon: 32, text: 'h6' },
    large: { icon: 40, text: 'h5' },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: sizes[size].icon * 1.5,
          height: sizes[size].icon * 1.5,
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <AttachMoney
          sx={{
            fontSize: sizes[size].icon,
            color: '#fff',
          }}
        />
      </Box>
      <Box>
        <Typography
          variant={sizes[size].text}
          sx={{
            fontWeight: 600,
            letterSpacing: '-0.5px',
            color: theme.palette.text.primary,
          }}
        >
          Agile
          <Box
            component="span"
            sx={{
              color: theme.palette.primary.main,
              marginLeft: '2px',
            }}
          >
            Finance
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default Logo;
