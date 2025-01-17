import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contract, ContractModification } from '../types/contract';
import { mockData } from '../lib/mockData';
import { format } from 'date-fns';
import { Plus, TrendingDown, TrendingUp, Package } from 'lucide-react';

interface ContractSummaryProps {
  contract: Contract;
  onAddModification: () => void;
}

export function ContractSummary({ contract, onAddModification }: ContractSummaryProps) {
  const { data: summary } = useQuery({
    queryKey: ['contract-summary', contract.id],
    queryFn: () => Promise.resolve(mockData.getContractSummary(contract.id)),
  });

  if (!summary) return null;

  const getModificationIcon = (type: ContractModification['modificationType']) => {
    switch (type) {
      case 'DESCONTO':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'ACRESCIMO':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'SERVICO_ADD':
      case 'SERVICO_REMOVE':
        return <Package className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Resumo do Contrato</h2>
        <button
          onClick={onAddModification}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Modificação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Valor Base</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(summary.baseValue)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total de Ajustes</p>
          <p className={`text-lg font-semibold ${summary.adjustmentsTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.adjustmentsTotal)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total de Serviços</p>
          <p className="text-lg font-semibold text-blue-600">{formatCurrency(summary.servicesTotal)}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-600">Valor Atual</p>
          <p className="text-lg font-semibold text-indigo-900">{formatCurrency(summary.currentValue)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Modificações Recentes</h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Descrição</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valor</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data Efetiva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {summary.modifications.map((modification) => (
                <tr key={modification.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="flex items-center">
                      {getModificationIcon(modification.modificationType)}
                      <span className="ml-2 font-medium text-gray-900">
                        {modification.modificationType.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {modification.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`font-medium ${
                      modification.modificationType === 'DESCONTO' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(modification.modificationValue)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {format(new Date(modification.effectiveDate), 'dd/MM/yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Serviços Ativos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.services.map((service) => (
            <div key={service.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-500">
                    Início: {format(new Date(service.startDate), 'dd/MM/yyyy')}
                  </p>
                  {service.endDate && (
                    <p className="text-sm text-gray-500">
                      Término: {format(new Date(service.endDate), 'dd/MM/yyyy')}
                    </p>
                  )}
                </div>
                <span className="text-lg font-semibold text-indigo-600">
                  {formatCurrency(service.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}