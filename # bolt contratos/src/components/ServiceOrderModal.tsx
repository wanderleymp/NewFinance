import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, Plus, Phone, Monitor, Mail, Calendar, Clock, Package, Search,
  PhoneCall, ArrowRightCircle, CheckCircle, Ban, AlertCircle
} from 'lucide-react';
import { ServiceOrder, ServiceOrderAction } from '../types/serviceOrder';
import { format } from 'date-fns';
import { mockData } from '../lib/mockData';
import toast from 'react-hot-toast';

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOrder: ServiceOrder | null;
}

interface ActionFormData {
  type: 'call' | 'remote' | 'approval' | 'schedule' | 'service';
  details: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceId?: string;
}

const services = [
  { id: '1', name: 'Suporte Básico', value: 150.00 },
  { id: '2', name: 'Manutenção Preventiva', value: 300.00 },
  { id: '3', name: 'Consultoria Técnica', value: 500.00 },
];

const actions: ServiceOrderAction[] = [
  {
    id: '1',
    type: 'call',
    timestamp: new Date().toISOString(),
    details: 'Tentativa de contato com cliente',
  },
  {
    id: '2',
    type: 'remote',
    timestamp: new Date().toISOString(),
    details: 'Acesso remoto para diagnóstico',
  },
];

export function ServiceOrderModal({ isOpen, onClose, serviceOrder }: ServiceOrderModalProps) {
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { register, handleSubmit, watch, reset } = useForm<ActionFormData>({
    defaultValues: {
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      scheduledTime: format(new Date(), 'HH:mm'),
    }
  });

  const actionType = watch('type');

  const handleQuickAction = async (type: string, details: string) => {
    try {
      const now = new Date();
      const data = {
        type,
        details,
        scheduledDate: format(now, 'yyyy-MM-dd'),
        scheduledTime: format(now, 'HH:mm'),
      };
      
      // Here you would typically make an API call to save the action
      console.log('Quick action:', data);
      
      toast.success('Ação registrada com sucesso!');
    } catch (error) {
      toast.error('Erro ao registrar ação');
    }
  };

  const onSubmit = async (data: ActionFormData) => {
    try {
      // Here you would typically make an API call to save the action
      console.log('Nova ação:', data);
      toast.success('Ação registrada com sucesso!');
      setIsAddingAction(false);
      reset();
    } catch (error) {
      toast.error('Erro ao registrar ação');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {serviceOrder ? `OS #${serviceOrder.id} - ${serviceOrder.title}` : 'Nova Ordem de Serviço'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {serviceOrder && (
            <>
              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Ações Rápidas</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickAction('call', 'Tentativa de contato com cliente')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Registrar Contato
                  </button>
                  <button
                    onClick={() => handleQuickAction('remote', 'Iniciado acesso remoto')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
                  >
                    <ArrowRightCircle className="w-4 h-4 mr-2" />
                    Iniciar Acesso Remoto
                  </button>
                  <button
                    onClick={() => handleQuickAction('approval', 'Aprovação solicitada ao cliente')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Solicitar Aprovação
                  </button>
                  <button
                    onClick={() => handleQuickAction('completed', 'Serviço concluído com sucesso')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Concluir OS
                  </button>
                  <button
                    onClick={() => handleQuickAction('cancelled', 'Ordem de serviço cancelada')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Cancelar OS
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Detalhes do Cliente</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{serviceOrder.customer.name}</p>
                    <p className="text-sm text-gray-500">{serviceOrder.customer.email}</p>
                    <p className="text-sm text-gray-500">{serviceOrder.customer.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Informações da OS</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Status:</span>{' '}
                      {serviceOrder.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Prioridade:</span>{' '}
                      {serviceOrder.priority}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Tipo:</span>{' '}
                      {serviceOrder.serviceType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Action Form */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Ações</h3>
                  <button
                    onClick={() => setIsAddingAction(!isAddingAction)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAddingAction ? 'Cancelar' : 'Nova Ação'}
                  </button>
                </div>

                {isAddingAction && (
                  <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Ação
                        </label>
                        <select
                          {...register('type', { required: 'Tipo é obrigatório' })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="call">Contato</option>
                          <option value="remote">Acesso Remoto</option>
                          <option value="approval">Aprovação</option>
                          <option value="schedule">Agendamento</option>
                          <option value="service">Serviço</option>
                        </select>
                      </div>

                      {actionType === 'schedule' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Data
                            </label>
                            <input
                              type="date"
                              {...register('scheduledDate', { required: 'Data é obrigatória' })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Hora
                            </label>
                            <input
                              type="time"
                              {...register('scheduledTime', { required: 'Hora é obrigatória' })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                        </>
                      )}

                      {actionType === 'service' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Serviço
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10"
                              placeholder="Buscar serviço..."
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          <div className="mt-2 space-y-2">
                            {services
                              .filter(service => 
                                service.name.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map(service => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between p-2 rounded hover:bg-gray-100"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                                    <p className="text-sm text-gray-500">
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                      }).format(service.value)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Handle service selection
                                    }}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Selecionar
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detalhes
                      </label>
                      <textarea
                        {...register('details', { required: 'Detalhes são obrigatórios' })}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Descreva os detalhes da ação..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Registrar Ação
                      </button>
                    </div>
                  </form>
                )}

                {/* Action History */}
                <div className="mt-4 space-y-4">
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className="bg-gray-50 rounded-lg p-4 flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          {action.type === 'call' && <Phone className="w-4 h-4 text-blue-500" />}
                          {action.type === 'remote' && <Monitor className="w-4 h-4 text-purple-500" />}
                          <span className="font-medium text-gray-900">
                            {action.type === 'call' ? 'Contato' : 'Acesso Remoto'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{action.details}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(action.timestamp), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}