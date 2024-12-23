import React from 'react';
import { Box } from '@mui/material';

const FinanceIllustration = () => {
  return (
    <Box
      sx={{
        width: 400,
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 500 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.2))',
        }}
      >
        {/* Grid de fundo */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="500" height="300" fill="url(#grid)" />

        {/* Área do gráfico */}
        <path
          d="M50,250 L100,200 L150,220 L200,180 L250,150 L300,120 L350,80 L400,60 L450,30"
          stroke="#2C74B3"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            animation: 'dash 2s ease-out forwards',
          }}
        />

        {/* Área sob o gráfico */}
        <path
          d="M50,250 L100,200 L150,220 L200,180 L250,150 L300,120 L350,80 L400,60 L450,30 L450,250 L50,250"
          fill="url(#gradient)"
          fillOpacity="0.2"
          style={{
            animation: 'fadeIn 1s ease-out forwards',
          }}
        />

        {/* Gradiente */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2C74B3" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2C74B3" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Pontos no gráfico */}
        <circle cx="50" cy="250" r="6" fill="#2C74B3" className="point" />
        <circle cx="100" cy="200" r="6" fill="#2C74B3" className="point" />
        <circle cx="150" cy="220" r="6" fill="#2C74B3" className="point" />
        <circle cx="200" cy="180" r="6" fill="#2C74B3" className="point" />
        <circle cx="250" cy="150" r="6" fill="#2C74B3" className="point" />
        <circle cx="300" cy="120" r="6" fill="#2C74B3" className="point" />
        <circle cx="350" cy="80" r="6" fill="#2C74B3" className="point" />
        <circle cx="400" cy="60" r="6" fill="#2C74B3" className="point" />
        <circle cx="450" cy="30" r="6" fill="#2C74B3" className="point" />

        {/* Setas de crescimento */}
        <path
          d="M460,20 L450,30 L440,20"
          stroke="#2C74B3"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: 'fadeIn 1s ease-out forwards',
          }}
        />
      </svg>
    </Box>
  );
};

export default FinanceIllustration;
