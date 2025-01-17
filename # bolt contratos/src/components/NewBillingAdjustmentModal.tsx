import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { BillingAdjustment } from '../types/contract';
import { format } from 'date-fns';

interface NewBillingAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BillingAdjustment, 'id' | 'contractId' | 'applied' | 'createdAt'>) => void;
  nextBillingDate: string;
}

type FormData = {
  type: 'desconto' | 'acrescimo';
  value: number;
  description?: string;
  applicationDate: string;
};

export function NewBillingAdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
  nextBillingDate,
}: NewBillingAdjustmentModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 'desconto',
      applicationDate: format(new Date(nextBillingDate), 'yyyy-MM-dd'),
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 transform transition-all animate-slideIn">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Novo Ajuste Temporário</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Ajuste
              </label>
              <select
                {...register('type', { required: 'Tipo é obrigatório' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="desconto">Desconto</option>
                <option value="acrescimo">Acréscimo</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                {...register('value', {
                  required: 'Valor é obrigatório',
                  min: { value: 0.01, message: 'Valor deve ser maior que zero' },
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="0.00"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Aplicação
              </label>
              <input
                type="date"
                {...register('applicationDate', { required: 'Data de aplicação é obrigatória' })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.applicationDate && (
                <p className="mt-1 text-sm text-red-600">{errors.applicationDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (Opcional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Descreva o motivo do ajuste"
              />
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
              Adicionar Ajuste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}