import { createColumnHelper } from '@tanstack/react-table';
import { AccountReceivable } from '../../types/accounts-receivable';
import { Calendar } from 'lucide-react';

const columnHelper = createColumnHelper<AccountReceivable>();

export const columns = [
  columnHelper.accessor('installment_id', {
    header: 'ID',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('movement_id', {
    header: 'Movimento',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('full_name', {
    header: 'Cliente',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('value', {
    header: 'Valor',
    cell: info => parseFloat(info.getValue()).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }),
  }),
  columnHelper.accessor('due_date', {
    header: 'Vencimento',
    cell: info => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>{info.getValue().split('T')[0]}</span>
      </div>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span 
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          info.getValue() === 'Pendente' 
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('type_name', {
    header: 'Tipo',
    cell: info => info.getValue(),
  }),
];