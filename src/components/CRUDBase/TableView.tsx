import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Edit2, Trash2, Share2, Power, ChevronLeft, ChevronRight } from 'lucide-react';
import { BaseRecord } from './types';

interface TableViewProps<T extends BaseRecord> {
  data: T[];
  columns: any[];
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onToggleStatus?: (record: T) => void;
  renderCustomActions?: (record: T) => React.ReactNode;
}

export function TableView<T extends BaseRecord>({
  data,
  columns,
  onEdit,
  onDelete,
  onToggleStatus,
  renderCustomActions,
}: TableViewProps<T>) {
  const table = useReactTable({
    data,
    columns: [
      ...columns,
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button 
                onClick={() => onEdit(row.original)}
                className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
                title="Editar"
              >
                <Edit2 className="w-4 h-4 text-orange-500 group-hover:text-orange-600" />
              </button>
            )}
            {onToggleStatus && (
              <button 
                onClick={() => onToggleStatus(row.original)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
                title="Ativar/Desativar"
              >
                <Power className="w-4 h-4 text-gray-500 group-hover:text-gray-600" />
              </button>
            )}
            <button 
              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
            </button>
            {onDelete && (
              <button 
                onClick={() => onDelete(row.original)}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-600" />
              </button>
            )}
            {renderCustomActions && renderCustomActions(row.original)}
          </div>
        ),
      },
    ],
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
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
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
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors duration-200"
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
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}