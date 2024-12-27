import { createColumnHelper } from '@tanstack/react-table';
import { MovementStatus } from '../../types/movement-status';
import { ArrowDownUp } from 'lucide-react';

const columnHelper = createColumnHelper<MovementStatus>();

export const columns = [
  columnHelper.accessor('movement_status_categories.category_name', {
    header: 'Categoria',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('is_final', {
    header: 'Status Final',
    cell: info => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        info.getValue() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {info.getValue() ? 'Sim' : 'Não'}
      </span>
    ),
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
