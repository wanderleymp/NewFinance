import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Edit2, Trash2, Share2, Users, Power, ChevronLeft, ChevronRight } from 'lucide-react';
import { License } from '../../types/license';

const columnHelper = createColumnHelper<License>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Nome',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        info.getValue() === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {info.getValue() === 'active' ? 'Ativa' : 'Inativa'}
      </span>
    ),
  }),
  columnHelper.accessor('startDate', {
    header: 'Data Início',
    cell: info => new Date(info.getValue()).toLocaleDateString('pt-BR'),
  }),
  columnHelper.accessor('endDate', {
    header: 'Data Término',
    cell: info => new Date(info.getValue()).toLocaleDateString('pt-BR'),
  }),
  columnHelper.accessor('userCount', {
    header: 'Usuários',
    cell: info => info.getValue(),
  }),
  columnHelper.display({
    id: 'actions',
    cell: info => (
      <div className="flex items-center gap-2">
        <button 
          className="p-1.5 hover:bg-blue-50 rounded-lg group"
          title="Visualizar Usuários"
        >
          <Users className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
        </button>
        <button 
          className="p-1.5 hover:bg-purple-50 rounded-lg group"
          title="Editar"
        >
          <Edit2 className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
        </button>
        <button 
          className="p-1.5 hover:bg-green-50 rounded-lg group"
          title="Compartilhar"
        >
          <Share2 className="w-4 h-4 text-green-600 group-hover:text-green-700" />
        </button>
        <button 
          className="p-1.5 hover:bg-yellow-50 rounded-lg group"
          title={info.row.original.status === 'active' ? 'Desativar' : 'Ativar'}
        >
          <Power className="w-4 h-4 text-yellow-600 group-hover:text-yellow-700" />
        </button>
        <button 
          className="p-1.5 hover:bg-red-50 rounded-lg group"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
        </button>
      </div>
    ),
  }),
];

interface LicensesTableProps {
  data: License[];
}

export const LicensesTable: React.FC<LicensesTableProps> = ({ data }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-50 border-y border-gray-200">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};