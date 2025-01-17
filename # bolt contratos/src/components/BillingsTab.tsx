import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contract, Billing } from '../types/contract';
import { mockData } from '../lib/mockData';
import { format } from 'date-fns';
import { Receipt, Send, Eye, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { NotificationModal } from './NotificationModal';

interface BillingsTabProps {
  contract: Contract;
}

export function BillingsTab({ contract }: BillingsTabProps) {
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const { data: billings = [] } = useQuery({
    queryKey: ['billings', contract.id],
    queryFn: () => mockData.getBillings(contract.id),
  });

  const handleSendNotification = async (billing: Billing) => {
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notificação enviada com sucesso!');
      setIsNotificationModalOpen(false);
      setSelectedBilling(null);
    } catch (error) {
      toast.error('Erro ao enviar notificação. Tente novamente.');
    }
  };

  const filteredBillings = billings.filter(billing => {
    const matchesSearch = 
      billing.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.value.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || billing.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por número ou valor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'paid')}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="paid">Pagos</option>
        </select>
      </div>

      {filteredBillings.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum faturamento encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Não foram encontrados faturamentos com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data do Faturamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notificado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBillings.map((billing) => (
                  <tr key={billing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Receipt className="w-4 h-4 text-gray-400" />
                        <span>{billing.number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(billing.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        billing.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {billing.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(billing.billingDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(billing.dueDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {billing.notified ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBilling(billing);
                            setIsNotificationModalOpen(true);
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            billing.status === 'paid'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-indigo-600 hover:bg-indigo-50'
                          }`}
                          disabled={billing.status === 'paid'}
                          title={
                            billing.status === 'paid'
                              ? 'Não é possível notificar uma fatura paga'
                              : 'Enviar Notificação'
                          }
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => console.log('Visualizar fatura:', billing)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Visualizar Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setSelectedBilling(null);
        }}
        onConfirm={() => selectedBilling && handleSendNotification(selectedBilling)}
        billing={selectedBilling}
      />
    </div>
  );
}