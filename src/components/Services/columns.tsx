import { createColumnHelper } from '@tanstack/react-table';
import { Service } from '../../types/service';
import { Package2 } from 'lucide-react';

const columnHelper = createColumnHelper<Service>();

export const columns = [
  columnHelper.accessor('code', {
    header: 'Código',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Nome',
    cell: info => (
      <div className="flex items-center gap-2">
        <Package2 className="w-4 h-4 text-blue-500" />
        <span>{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('description', {
    header: 'Descrição',
    cell: info => info.getValue() || '-',
  }),
  columnHelper.accessor('price', {
    header: 'Preço',
    cell: info => parseFloat(info.getValue()).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }),
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