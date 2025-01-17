import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Search, User, Phone, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { mockData } from '../lib/mockData';
import toast from 'react-hot-toast';

interface NewChatFormData {
  customerId: string;
  title: string;
  initialMessage: string;
  serviceOrderId?: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewChatFormData) => void;
}

export function NewChatModal({ isOpen, onClose, onSubmit }: NewChatModalProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<NewChatFormData>();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showNewCustomer, setShowNewCustomer] = React.useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => mockData.getCustomers(),
  });

  const { data: serviceOrders = [] } = useQuery({
    queryKey: ['service-orders'],
    queryFn: () => mockData.getServiceOrders(),
  });

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.document.includes(searchTerm)
  );

  const handleNewCustomerSubmit = (data: any) => {
    // Aqui você faria a chamada para criar um novo cliente
    console.log('Novo cliente:', data);
    toast.success('Cliente cadastrado com sucesso!');
    setShowNewCustomer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nova Conversa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!showNewCustomer ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Busca de Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Buscar por nome ou documento..."
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {/* Lista de Clientes */}
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setValue('customerId', customer.id);
                        setSearchTerm(customer.name);
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.document}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.phone}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewCustomer(true)}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  + Cadastrar novo cliente
                </button>
              </div>

              {/* Título da Conversa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Conversa
                </label>
                <input
                  {...register('title', { required: 'Título é obrigatório' })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ex: Suporte Técnico - Sistema ERP"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Mensagem Inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem Inicial
                </label>
                <textarea
                  {...register('initialMessage', { required: 'Mensagem inicial é obrigatória' })}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Digite a primeira mensagem da conversa..."
                />
                {errors.initialMessage && (
                  <p className="mt-1 text-sm text-red-600">{errors.initialMessage.message}</p>
                )}
              </div>

              {/* Vincular OS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vincular a uma OS (Opcional)
                </label>
                <select
                  {...register('serviceOrderId')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Selecione uma OS</option>
                  {serviceOrders
                    .filter(order => order.status !== 'completed')
                    .map(order => (
                      <option key={order.id} value={order.id}>
                        OS #{order.id} - {order.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Iniciar Conversa
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit(handleNewCustomerSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Digite o nome completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}