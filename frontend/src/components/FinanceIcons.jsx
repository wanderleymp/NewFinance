import React from 'react';
import { Box } from '@mui/material';
import { 
  ShowChart, 
  PieChart, 
  BarChart, 
  Timeline, 
  TrendingUp,
  AccountBalance,
  Payment,
  CreditCard,
  Savings,
  Calculate
} from '@mui/icons-material';

const FloatingIcon = ({ Icon, delay, duration, size, top, left, right, bottom }) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      zIndex: 1,
      color: 'rgba(255, 255, 255, 0.1)',
      animation: `float ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      transform: 'scale(1)',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'scale(1.2)',
        color: 'rgba(255, 255, 255, 0.2)',
      },
    }}
  >
    <Icon sx={{ fontSize: size }} />
  </Box>
);

const FinanceIcons = () => {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <FloatingIcon Icon={ShowChart} delay={0} duration={6} size={60} top="10%" left="5%" />
      <FloatingIcon Icon={PieChart} delay={1} duration={8} size={40} top="20%" right="10%" />
      <FloatingIcon Icon={BarChart} delay={2} duration={7} size={50} bottom="15%" left="8%" />
      <FloatingIcon Icon={Timeline} delay={3} duration={9} size={45} bottom="25%" right="15%" />
      <FloatingIcon Icon={TrendingUp} delay={4} duration={7} size={55} top="40%" left="12%" />
      <FloatingIcon Icon={AccountBalance} delay={2} duration={8} size={50} top="15%" right="25%" />
      <FloatingIcon Icon={Payment} delay={3} duration={6} size={40} bottom="35%" left="20%" />
      <FloatingIcon Icon={CreditCard} delay={1} duration={7} size={45} top="25%" left="30%" />
      <FloatingIcon Icon={Savings} delay={4} duration={9} size={50} bottom="20%" right="5%" />
      <FloatingIcon Icon={Calculate} delay={0} duration={8} size={35} top="45%" right="18%" />
    </Box>
  );
};

export default FinanceIcons;
