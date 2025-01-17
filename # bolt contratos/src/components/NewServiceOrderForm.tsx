import React from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { mockData } from '../lib/mockData';
import { format } from 'date-fns';

interface NewServiceOrderFormData {
  title: string;
  description: string;
  serviceType: string;
  priority: 'low' | 'medium' | 'high';
  customerId: string;
  requesterId: string;
  assignedTo?: string;
  openingDate: string;
  openingTime: string;
}

interface NewServiceOrderFormProps {
  onSubmit: (data: NewServiceOrderFormData) => void;
  onCancel: () => void;
}

export function NewServiceOrderForm({ onSubmit, onCancel }: NewServiceOrderFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<NewServiceOrderFormData>({
    defaultValues: {
      openingDate: format(new Date(), 'yyyy-MM-dd'),
      openingTime: format(new Date(), 'HH:mm'),
    }
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => mockData.getCustomers(),
  });

  const { data: requesters = [] } = useQuery({
    queryKey: ['requesters'],
    queryFn: () => mockData.getRequesters(),
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => mockData.getTechnicians(),
  });

  const onSubmitForm = async (data: NewServiceOrderFormData) => {
    try {
      await onSubmit(data);
      toast.success('Ordem de serviço criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar ordem de serviço');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data e Hora de Abertura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Abertura
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              {...register('openingDate', { required: 'Data de abertura é obrigatória' })}
              className="form-input pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          {errors.openingDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.openingDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora de Abertura
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="time"
              {...register('openingTime', { required: 'Hora de abertura é obrigatória' })}
              className="form-input pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          {errors.openingTime && (
            <p className="mt-1 text-sm text-red-600">
              {errors.openingTime.message}
            </p>
          )}
        </div>

        {/* Cliente e Solicitante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <select
            {...register('customerId', { required: 'Cliente é obrigatório' })}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Selecione um cliente</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.customerId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Solicitante
          </label>
          <select
            {...register('requesterId', { required: 'Solicitante é obrigatório' })}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Selecione um solicitante</option>
            {requesters.map(requester => (
              <option key={requester.id} value={requester.id}>
                {requester.name}
              </option>
            ))}
          </select>
          {errors.requesterId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.requesterId.message}
            </p>
          )}
        </div>

        {/* Tipo de Serviço e Prioridade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Serviço
          </label>
          <select
            {...register('serviceType', { required: 'Tipo de serviço é obrigatório' })}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Selecione um tipo</option>
            <option value="Suporte Técnico">Suporte Técnico</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Instalação">Instalação</option>
            <option value="Treinamento">Treinamento</option>
            <option value="Consultoria">Consultoria</option>
          </select>
          {errors.serviceType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.serviceType.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridade
          </label>
          <select
            {...register('priority', { required: 'Prioridade é obrigatória' })}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Selecione a prioridade</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">
              {errors.priority.message}
            </p>
          )}
        </div>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          {...register('title', { 
            required: 'Título é obrigatório',
            minLength: { value: 3, message: 'Mínimo de 3 caracteres' }
          })}
          className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Ex: Manutenção de Servidor"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          {...register('description', { 
            required: 'Descrição é obrigatória',
            minLength: { value: 10, message: 'Mínimo de 10 caracteres' }
          })}
          rows={4}
          className="form-textarea w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Descreva detalhadamente o problema..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Atribuir para */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Atribuir para (Opcional)
        </label>
        <select
          {...register('assignedTo')}
          className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Selecione um técnico</option>
          {technicians.map(technician => (
            <option key={technician.id} value={technician.id}>
              {technician.name}
            </option>
          ))}
        </select>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Criar Ordem de Serviço
        </button>
      </div>
    </form>
  );
}