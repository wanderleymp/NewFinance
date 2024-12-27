import React from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';

interface SaleDashboardProps {
  metrics: {
    title: string;
    value: string | number;
    trend?: number;
    color?: string;
    textColor?: string;
  }[];
}

export const SaleDashboard: React.FC<SaleDashboardProps> = ({ metrics }) => {
  const icons = {
    'Total de Vendas': DollarSign,
    'Vendas do Dia': ShoppingBag,
    'Ticket Médio': Users,
    'Crescimento': TrendingUp,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = icons[metric.title as keyof typeof icons] || TrendingUp;
        
        return (
          <div
            key={index}
            className={`${metric.color || 'bg-white'} p-6 rounded-xl shadow-sm ${
              !metric.color ? 'border border-gray-200' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${metric.textColor || 'text-gray-500'}`}>
                  {metric.title}
                </p>
                <h3 className={`text-2xl font-bold mt-1 ${metric.textColor || 'text-gray-900'}`}>
                  {metric.value}
                </h3>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                metric.color || 'bg-blue-100'
              }`}>
                <Icon className={`w-6 h-6 ${metric.textColor || 'text-blue-600'}`} />
              </div>
            </div>
            {metric.trend !== undefined && (
              <div className="mt-4 flex items-center gap-1">
                <span className={`text-sm ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                </span>
                <span className="text-gray-500 text-sm">vs. último mês</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};