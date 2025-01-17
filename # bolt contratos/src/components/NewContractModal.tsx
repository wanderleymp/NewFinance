import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Contract, BillingReference, ContractStatus } from '../types/contract';
import { mockData } from '../lib/mockData';
import { format } from 'date-fns';

type NewContractFormData = Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'currentValue'>;

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewContractFormData) => void;
}

const contractGroups = [
  { id: 1, name: 'Grupo A' },
  { id: 2, name: 'Grupo B' },
  { id: 3, name: 'Grupo C' },
];

const representatives = [
  { id: 1, name: 'João Silva' },
  { id: 2, name: 'Maria Santos' },
  { id: 3, name: 'Pedro Oliveira' },
];

export function NewContractModal({ isOpen, onClose, onSubmit }: NewContractModalProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<NewContractFormData>({
    defaultValues: {
      status: 'ativo',
      billingReference: 'current',
      recurrencePeriod: 'monthly',
    }
  });

  if (!isOpen) return null;

  const onSubmitForm = (data: NewContractFormData) => {
    const formattedData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      nextBillingDate: new Date(data.nextBillingDate).toISOString(),
    };
    onSubmit(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 transform transition-all animate-slideIn">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Novo Contrato</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Contrato
              </label>
              <input
                {...register('name', { required: 'Nome é obrigatório' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Digite o nome do contrato"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Inicial
              </label>
              <input
                type="number"
                step="0.01"
                {...register('initialValue', { 
                  required: 'Valor inicial é obrigatório',
                  min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="0.00"
              />
              {errors.initialValue && (
                <p className="mt-1 text-sm text-red-600">{errors.initialValue.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período de Recorrência
              </label>
              <select
                {...register('recurrencePeriod', { required: 'Período é obrigatório' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
              {errors.recurrencePeriod && (
                <p className="mt-1 text-sm text-red-600">{errors.recurrencePeriod.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register('status', { required: 'Status é obrigatório' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="encerrado">Encerrado</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo
              </label>
              <select
                {...register('group', { required: 'Grupo é obrigatório' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Selecione um grupo</option>
                {contractGroups.map(group => (
                  <option key={group.id} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
              {errors.group && (
                <p className="mt-1 text-sm text-red-600">{errors.group.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pessoa Associada
              </label>
              <select
                {...register('personId', { required: 'Pessoa associada é obrigatória' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Selecione uma pessoa</option>
                {mockData.people.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name} - {person.document}
                  </option>
                ))}
              </select>
              {errors.personId && (
                <p className="mt-1 text-sm text-red-600">{errors.personId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável
              </label>
              <select
                {...register('representativePersonId', { required: 'Responsável é obrigatório' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Selecione um responsável</option>
                {representatives.map(rep => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name}
                  </option>
                ))}
              </select>
              {errors.representativePersonId && (
                <p className="mt-1 text-sm text-red-600">{errors.representativePersonId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referência de Faturamento
              </label>
              <select
                {...register('billingReference', { required: 'Referência é obrigatória' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="current">Período Atual</option>
                <option value="advance">Antecipado</option>
              </select>
              {errors.billingReference && (
                <p className="mt-1 text-sm text-red-600">{errors.billingReference.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início
              </label>
              <input
                type="date"
                {...register('startDate', { required: 'Data de início é obrigatória' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próximo Faturamento
              </label>
              <input
                type="date"
                {...register('nextBillingDate', { required: 'Data do próximo faturamento é obrigatória' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.nextBillingDate && (
                <p className="mt-1 text-sm text-red-600">{errors.nextBillingDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dia de Vencimento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                {...register('dueDay', { 
                  required: 'Dia de vencimento é obrigatório',
                  min: { value: 1, message: 'Dia deve ser entre 1 e 31' },
                  max: { value: 31, message: 'Dia deve ser entre 1 e 31' }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Dia do mês"
              />
              {errors.dueDay && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDay.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
            >
              Criar Contrato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}