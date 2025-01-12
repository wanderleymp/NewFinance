import React from 'react';
import { Box } from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  TrendingUp,
  PieChart,
  Savings,
  Receipt,
  AttachMoney,
  BarChart
} from '@mui/icons-material';

const FloatingIcon = ({ Icon, top, left, delay }) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      left,
      color: 'rgba(255, 255, 255, 0.2)',
      animation: 'float 6s ease-in-out infinite',
      animationDelay: delay,
      '@keyframes float': {
        '0%, 100%': {
          transform: 'translate(0, 0)',
        },
        '50%': {
          transform: 'translate(20px, -20px)',
        },
      },
    }}
  >
    <Icon sx={{ fontSize: 40 }} />
  </Box>
);

const FinanceIcons = () => {
  const icons = [
    { Icon: AccountBalance, top: '10%', left: '10%', delay: '0s' },
    { Icon: CreditCard, top: '20%', left: '80%', delay: '0.5s' },
    { Icon: TrendingUp, top: '70%', left: '15%', delay: '1s' },
    { Icon: PieChart, top: '80%', left: '75%', delay: '1.5s' },
    { Icon: Savings, top: '40%', left: '5%', delay: '2s' },
    { Icon: Receipt, top: '30%', left: '90%', delay: '2.5s' },
    { Icon: AttachMoney, top: '60%', left: '85%', delay: '3s' },
    { Icon: BarChart, top: '50%', left: '10%', delay: '3.5s' },
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      {icons.map((props, index) => (
        <FloatingIcon key={index} {...props} />
      ))}
    </Box>
  );
};

export default FinanceIcons;
