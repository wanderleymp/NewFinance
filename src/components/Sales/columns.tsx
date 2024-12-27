import { createColumnHelper } from '@tanstack/react-table';
import { Building2, Calendar } from 'lucide-react';
import { Sale } from '../../types/sale';

const columnHelper = createColumnHelper<Sale>();

export const columns = [
  columnHelper.accessor('movement_id', {
    header: 'ID',
    cell: info => <span className="text-gray-600">#{info.getValue()}</span>,
  }),
  columnHelper.accessor('movement_date', {
    header: 'Data',
    cell: info => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>{new Date(info.getValue()).toLocaleDateString('pt-BR')}</span>
      </div>
    ),
  }),
  columnHelper.accessor(row => ({ 
    full_name: row.full_name,
    fantasy_name: row.fantasy_name
  }), {
    id: 'client',
    header: 'Cliente',
    cell: info => {
      const { full_name, fantasy_name } = info.getValue();
      return (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-500" />
          <div>
            <p className="font-medium">{full_name}</p>
            {fantasy_name && (
              <p className="text-sm text-gray-500">{fantasy_name}</p>
            )}
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor('total_amount', {
    header: 'Valor Total',
    cell: info => (
      <div className="text-right">
        <span className="font-medium">
          {parseFloat(info.getValue()).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor('status_name', {
    header: 'Status',
    cell: info => {
      const status = info.getValue();
      if (!status) return '-';
      
      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case 'pendente':
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
          case 'em análise':
            return 'bg-blue-100 text-blue-800 border border-blue-200';
          case 'aprovado':
            return 'bg-green-100 text-green-800 border border-green-200';
          case 'concluído':
            return 'bg-purple-100 text-purple-800 border border-purple-200';
          case 'cancelado':
            return 'bg-red-100 text-red-800 border border-red-200';
          default:
            return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
      };

      return (
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getStatusColor(status)}`}>
          {status}
        </span>
      );
    },
  }),
];