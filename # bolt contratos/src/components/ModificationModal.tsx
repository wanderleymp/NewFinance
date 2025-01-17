import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Contract, ModificationType } from '../types/contract';

interface ModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onSubmit: (data: NewModificationFormData) => void;
}

interface NewModificationFormData {
  modificationType: keyof typeof ModificationType;
  modificationValue: number;
  description: string;
  effectiveDate: string;
  serviceId?: string;
}

export function ModificationModal({ isOpen, onClose, contract, onSubmit }: ModificationModalProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<NewModificationFormData>();
  const modificationType = watch('modificationType');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 transform transition-all animate-slideIn">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nova Modificação</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Modificação
              </label>
              <select
                {...register('modificationType', { required: 'Tipo é obrigatório' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Selecione um tipo</option>
                {Object.entries(ModificationType).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errors.modificationType && (
                <p className="mt-1 text-sm text-red-600">{errors.modificationType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                {...register('modificationValue', {
                  required: 'Valor é obrigatório',
                  min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="0.00"
              />
              {errors.modificationValue && (
                <p className="mt-1 text-sm text-red-600">{errors.modificationValue.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                {...register('description', { required: 'Descrição é obrigatória' })}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Descreva o motivo da modificação"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Efetiva
              </label>
              <input
                type="date"
                {...register('effectiveDate', { required: 'Data efetiva é obrigatória' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.effectiveDate && (
                <p className="mt-1 text-sm text-red-600">{errors.effectiveDate.message}</p>
              )}
            </div>

            {(modificationType === 'SERVICO_ADD' || modificationType === 'SERVICO_REMOVE') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serviço
                </label>
                <select
                  {...register('serviceId', { required: 'Serviço é obrigatório' })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Selecione um serviço</option>
                  {/* Aqui você pode adicionar as opções de serviços disponíveis */}
                </select>
                {errors.serviceId && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>
                )}
              </div>
            )}
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
              Adicionar Modificação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}