import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

interface CloseServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CloseServiceOrderData) => void;
}

interface CloseServiceOrderData {
  solution: string;
  notes: string;
}

export function CloseServiceOrderModal({ isOpen, onClose, onConfirm }: CloseServiceOrderModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CloseServiceOrderData>();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Encerrar Conversa e OS</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onConfirm)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solução Aplicada
            </label>
            <textarea
              {...register('solution', { required: 'Solução é obrigatória' })}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Descreva a solução aplicada..."
            />
            {errors.solution && (
              <p className="mt-1 text-sm text-red-600">{errors.solution.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações Adicionais
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Observações opcionais..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Confirmar Encerramento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}