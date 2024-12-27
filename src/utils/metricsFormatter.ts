import { Sale } from '../types/sale';

export const formatSaleMetrics = (sales: Sale[], totalSales: number) => {
  const totalAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
  const averageAmount = sales.length > 0 ? totalAmount / sales.length : 0;
  
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.movement_date).toDateString();
    const today = new Date().toDateString();
    return saleDate === today;
  });

  const todayAmount = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

  return [
    {
      title: 'Total de Vendas',
      value: totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      trend: 12.5,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white'
    },
    {
      title: 'Vendas do Dia',
      value: todayAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      trend: 8.2,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-white'
    },
    {
      title: 'Ticket Médio',
      value: averageAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      trend: -2.1,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white'
    },
    {
      title: 'Crescimento',
      value: '32.8%',
      trend: 4.1,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      textColor: 'text-white'
    }
  ];
};