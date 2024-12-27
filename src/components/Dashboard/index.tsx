import React from 'react';
import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { Chart } from './Chart';
import { RecentTransactions } from './RecentTransactions';

export const Dashboard: React.FC = () => {
  const metrics = [
    {
      title: 'Receita Total',
      value: 'R$ 75.400',
      trend: 12.5,
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'Clientes Ativos',
      value: '245',
      trend: 8.2,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Contratos',
      value: '89',
      trend: -2.4,
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: 'Crescimento',
      value: '32.8%',
      trend: 4.1,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Chart />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};