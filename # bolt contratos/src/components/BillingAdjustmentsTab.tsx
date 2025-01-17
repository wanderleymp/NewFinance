import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contract, BillingAdjustment } from '../types/contract';
import { mockData } from '../lib/mockData';
import { format } from 'date-fns';
import { Plus, ArrowDown, ArrowUp } from 'lucide-react';
import { NewBillingAdjustmentModal } from './NewBillingAdjustmentModal';

interface BillingAdjustmentsTabProps {
  contract: Contract;
}

export function BillingAdjustmentsTab({ contract }: BillingAdjustmentsTabProps) {
  const [isNewAdjustmentModalOpen, setIsNewAdjustmentModalOpen] = useState(false);

  const { data: pendingAdjustments = [] } = useQuery({
    queryKey: ['billing-adjustments', contract.id, 'pending'],
    queryFn: () => mockData.getBillingAdjustments(contract.id, false),
  });

  const { data: appliedAdjustments = [] } = useQuery({
    queryKey: ['billing-adjustments', contract.id, 'applied'],
    queryFn: () => mockData.getBillingAdjustments(contract.id, true),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleNewAdjustment = (data: Omit<BillingAdjustment, 'id' | 'contractId' | 'applied' | 'createdAt'>) => {
    console.log('Novo ajuste:', data);
    setIsNewAdjustmentModalOpen(false);
  };

  const AdjustmentList = ({ adjustments, title }: { adjustments: BillingAdjustment[], title: string }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {adjustments.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum ajuste encontrado.</p>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valor</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data de Aplicação</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {adjustments.map((adjustment) => (
                <tr key={adjustment.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="flex items-center">
                      {adjustment.type === 'desconto' ? (
                        <ArrowDown className="w-4 h-4 text-red-500 mr-2" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-green-500 mr-2" />
                      )}
                      <span className={`font-medium ${
                        adjustment.type === 'desconto' ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {adjustment.type === 'desconto' ? 'Desconto' : 'Acréscimo'}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`font-medium ${
                      adjustment.type === 'desconto' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(adjustment.value)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {format(new Date(adjustment.applicationDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {adjustment.description || '-'}
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
        <h2 className="text-xl font-semibold text-gray-900">Ajustes Temporários</h2>
        <button
          onClick={() => setIsNewAdjustmentModalOpen(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Ajuste
        </button>
      </div>

      <div className="space-y-8">
        <AdjustmentList
          adjustments={pendingAdjustments}
          title="Ajustes Pendentes para o Próximo Faturamento"
        />
        
        <AdjustmentList
          adjustments={appliedAdjustments}
          title="Histórico de Ajustes Aplicados"
        />
      </div>

      <NewBillingAdjustmentModal
        isOpen={isNewAdjustmentModalOpen}
        onClose={() => setIsNewAdjustmentModalOpen(false)}
        onSubmit={handleNewAdjustment}
        nextBillingDate={contract.nextBillingDate}
      />
    </div>
  );
}