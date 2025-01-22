import React, { useState, useEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Contract } from '../types/contract';
import { mockData } from '../services/mockData';
import { format } from 'date-fns';
import { Edit2, Trash2, Eye, Plus, ArrowUpDown, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { BillingConfirmationModal } from '../components/BillingConfirmationModal';

interface ContractTableProps {
  contracts: Contract[];
  onManageServices: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  onView: (contract: Contract) => void;
}

export function ContractTable({ 
  contracts, 
  onManageServices, 
  onEdit, 
  onDelete,
  onView 
}: ContractTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  const columnHelper = createColumnHelper<Contract>();

  const handleBillContract = async () => {
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Faturamento realizado com sucesso!');
      setIsConfirmationOpen(false);
      setSelectedContract(null);
    } catch (error) {
      toast.error('Erro ao realizar faturamento. Tente novamente.');
    }
  };

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value || 0);
    } catch (error) {
      console.error('Erro ao formatar valor:', error);
      return 'R$ 0,00';
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    try {
      if (!date) return 'N/A';
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'N/A';
    }
  };

  useEffect(() => {
    console.group('🔍 Contratos na Tabela');
    console.log('Total de contratos:', contracts.length);
    contracts.forEach((contract, index) => {
      console.log(`Contrato #${index + 1}:`, {
        id: contract.id,
        name: contract.name,
        value: contract.value,
        status: contract.status,
        fullDetails: contract
      });
    });
    console.groupEnd();
  }, [contracts]);

  const columns = [
    columnHelper.accessor('name', {
      header: 'Nome do Contrato',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('personId', {
      header: 'Pessoa Associada',
      cell: info => {
        const personId = info.getValue();
        const person = mockData.people.find(p => p.id === personId);
        return person ? `${person.name} (${person.document})` : 'N/A';
      },
    }),
    columnHelper.accessor('currentValue', {
      header: 'Valor Atual',
      cell: info => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          info.getValue() === 'ativo' ? 'bg-green-100 text-green-800' :
          info.getValue() === 'inativo' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('nextBillingDate', {
      header: 'Próximo Faturamento',
      cell: info => formatDate(info.getValue()),
    }),
    columnHelper.accessor('group', {
      header: 'Grupo',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('billingReference', {
      header: 'Ref. Faturamento',
      cell: info => info.getValue() === 'current' ? 'Atual' : 'Antecipado',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: info => {
        const contract = info.row.original;
        const canBill = contract.status === 'ativo';

        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onManageServices(info.row.original)}
              className="p-1.5 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
              title="Gerenciar Serviços"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onView(info.row.original)}
              className="p-1.5 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
              title="Gerenciar Ajustes"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (canBill) {
                  setSelectedContract(contract);
                  setIsConfirmationOpen(true);
                }
              }}
              disabled={!canBill}
              className={`p-1.5 rounded transition-colors ${
                canBill
                  ? 'hover:bg-indigo-50 text-indigo-600'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title={canBill ? 'Faturar Contrato' : 'Contrato não pode ser faturado'}
            >
              <Receipt className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <button
              onClick={() => onView(info.row.original)}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
              title="Visualizar"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(info.row.original)}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(info.row.original)}
              className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: contracts,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        <span className="ml-2">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedContract && (
        <BillingConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => {
            setIsConfirmationOpen(false);
            setSelectedContract(null);
          }}
          onConfirm={handleBillContract}
          contract={selectedContract}
        />
      )}
    </>
  );
}