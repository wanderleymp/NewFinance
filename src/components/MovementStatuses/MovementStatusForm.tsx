import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MovementStatus } from '../../types/movement-status';
import { MovementStatusService } from '../../services/MovementStatusService';

interface MovementStatusFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  movementStatus?: MovementStatus | null;
}

export const MovementStatusForm: React.FC<MovementStatusFormProps> = ({
  isOpen,
  onClose,
  onSave,
  movementStatus,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    status_name: '',
    description: '',
    status_category_id: 1,
    movement_type_id: 1,
    is_final: false,
    display_order: 0,
    active: true
  });

  useEffect(() => {
    if (movementStatus) {
      setFormData({
        status_name: movementStatus.status_name,
        description: movementStatus.description || '',
        status_category_id: movementStatus.status_category_id,
        movement_type_id: movementStatus.movement_type_id,
        is_final: movementStatus.is_final,
        display_order: movementStatus.display_order || 0,
        active: movementStatus.active
      });
    } else {
      setFormData({
        status_name: '',
        description: '',
        status_category_id: 1,
        movement_type_id: 1,
        is_final: false,
        display_order: 0,
        active: true
      });
    }
  }, [movementStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.status_name.trim()) {
      toast.error('Digite o nome do status');
      return;
    }

    try {
      setIsLoading(true);
      if (movementStatus) {
        await MovementStatusService.updateMovementStatus(movementStatus.movement_status_id, formData);
      } else {
        await MovementStatusService.createMovementStatus(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      // Error is handled by the service
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {movementStatus ? 'Editar Status' : 'Novo Status'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={formData.status_name}
                onChange={(e) => setFormData(prev => ({ ...prev, status_name: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimento
              </label>
              <select
                value={formData.movement_type_id}
                onChange={(e) => setFormData(prev => ({ ...prev, movement_type_id: Number(e.target.value) }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
                required
              >
                <option value={1}>Tipo 1</option>
                <option value={2}>Tipo 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={formData.status_category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, status_category_id: Number(e.target.value) }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
                required
              >
                <option value={1}>Categoria 1</option>
                <option value={2}>Categoria 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordem de Exibição
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_final}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_final: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Status Final</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Ativo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (movementStatus ? 'Salvando...' : 'Criando...') : (movementStatus ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};