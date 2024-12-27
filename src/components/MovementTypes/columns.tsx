import { createColumnHelper } from '@tanstack/react-table';
import { MovementType } from '../../types/movement-type';
import { ArrowDownUp } from 'lucide-react';

const columnHelper = createColumnHelper<MovementType>();

export const columns = [
  columnHelper.accessor('type_name', {
    header: 'Nome',
    cell: info => (
      <div className="flex items-center gap-2">
        <ArrowDownUp className="w-4 h-4 text-blue-500" />
        <span>{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('_count.movements', {
    header: 'Movimentações',
    cell: info => info.getValue() || 0,
  }),
  columnHelper.accessor('_count.movement_statuses', {
    header: 'Status',
    cell: info => info.getValue() || 0,
  }),
];