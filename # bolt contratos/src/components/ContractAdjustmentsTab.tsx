import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contract, ContractAdjustment } from '../types/contract';
import { mockData } from '../lib/mockData';
import { format } from 'date-fns';
import { Plus, TrendingUp, CalendarDays } from 'lucide-react';
import { NewAdjustmentModal } from './NewAdjustmentModal';

interface ContractAdjustmentsTabProps {
  contract: Contract;
}

export function ContractAdjustmentsTab({ contract }: ContractAdjustmentsTabProps) {
  const [isNewAdjustmentModalOpen, setIsNewAdjustmentModalOpen] = useState(false);

  const { data: appliedAdjustments = [] } = useQuery({
    queryKey: ['contract-adjustments', contract.id, 'applied'],
    queryFn: () => mockData.getContractAdjustments(contract.id, true),
  });

  const { data: scheduledAdjustments = [] } = useQuery({
    queryKey: ['contract-adjustments', contract.id, 'scheduled'],
    queryFn: () => mockData.getContractAdjustments(contract.id, false),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const AdjustmentTable = ({ adjustments, title }: { adjustments: ContractAdjustment[], title: string }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {title === 'Reajustes Programados' ? (
          <CalendarDays className="w-5 h-5 text-indigo-500" />
        ) : (
          <TrendingUp className="w-5 h-5 text-green-500" />
        )}
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      
      {adjustments.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum reajuste encontrado.</p>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valor do Reajuste</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valor Anterior</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Novo Valor</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data de Aplicação</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Justificativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {adjustments.map((adjustment) => (
                <tr key={adjustment.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {adjustment.type === 'percentage' ? 'Percentual' : 'Valor Fixo'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {adjustment.type === 'percentage' 
                      ? formatPercentage(adjustment.value)
                      : formatCurrency(adjustment.value)
                    }
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {formatCurrency(adjustment.previousValue)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {formatCurrency(adjustment.newValue)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {format(new Date(adjustment.applicationDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {adjustment.justification || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Reajustes do Contrato</h2>
        <button
          onClick={() => setIsNewAdjustmentModalOpen(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Reajuste
        </button>
      </div>

      <div className="space-y-8">
        <AdjustmentTable
          adjustments={scheduledAdjustments}
          title="Reajustes Programados"
        />
        
        <AdjustmentTable
          adjustments={appliedAdjustments}
          title="Histórico de Reajustes"
        />
      </div>

      <NewAdjustmentModal
        isOpen={isNewAdjustmentModalOpen}
        onClose={() => setIsNewAdjustmentModalOpen(false)}
        contract={contract}
      />
    </div>
  );
}