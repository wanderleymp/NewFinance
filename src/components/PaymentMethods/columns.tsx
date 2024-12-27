import { createColumnHelper } from '@tanstack/react-table';
import { PaymentMethod } from '../../types/payment-method';

const columnHelper = createColumnHelper<PaymentMethod>();

export const columns = [
  columnHelper.accessor('name', {
    header: 'Nome',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('description', {
    header: 'Descrição',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('active', {
    header: 'Status',
    cell: info => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        info.getValue() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {info.getValue() ? 'Ativo' : 'Inativo'}
      </span>
    ),
  }),
];