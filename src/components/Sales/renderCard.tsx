import React from 'react';
import { Building2, Calendar } from 'lucide-react';
import { Sale } from '../../types/sale';

export const renderSaleCard = (sale: Sale) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em análise':
        return 'bg-blue-100 text-blue-800';
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'concluído':
        return 'bg-purple-100 text-purple-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-medium">{sale.full_name}</h3>
            {sale.fantasy_name && (
              <p className="text-sm text-gray-500">{sale.fantasy_name}</p>
            )}
          </div>
        </div>
        {sale.status_name && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status_name)}`}>
            {sale.status_name}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{new Date(sale.movement_date).toLocaleDateString('pt-BR')}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Valor Total:</span>
          <span className="font-medium">
            {parseFloat(sale.total_amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </span>
        </div>

        {sale.description && (
          <p className="text-sm text-gray-500">{sale.description}</p>
        )}
      </div>
    </div>
  );
};