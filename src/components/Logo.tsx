import React from 'react';
import { TrendingUp } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <TrendingUp className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Agile Finance
      </span>
    </div>
  );
};