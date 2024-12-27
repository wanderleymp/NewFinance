import React from 'react';
import { MetricItem } from '../types';

interface MetricsHeaderProps {
  metrics: MetricItem[];
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className={`p-6 rounded-xl shadow-sm ${metric.color || 'bg-white border border-gray-200'}`}>
          <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
          <p className="text-2xl font-semibold mt-1">{metric.value}</p>
          {metric.trend !== undefined && (
            <div className="mt-2">
              <span className={`text-sm ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend >= 0 ? '+' : ''}{metric.trend}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs. último mês</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};