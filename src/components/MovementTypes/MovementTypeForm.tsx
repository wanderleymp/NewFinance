import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MovementType } from '../../types/movement-type';
import { MovementTypeService } from '../../services/MovementTypeService';

interface MovementTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  movementType?: MovementType | null;
}

export const MovementTypeForm: React.FC<MovementTypeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  movementType,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [typeName, setTypeName] = useState('');

  useEffect(() => {
    if (movementType) {
      setTypeName(movementType.type_name);
    } else {
      setTypeName('');
    }
  }, [movementType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typeName.trim()) {
      toast.error('Digite o nome do tipo de movimento');
      return;
    }

    if (typeName.length > 50) {
      toast.error('O nome deve ter no máximo 50 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      if (movementType) {
        await MovementTypeService.updateMovementType(movementType.movement_type_id, typeName);
      } else {
        await MovementTypeService.createMovementType(typeName);
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
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {movementType ? 'Editar Tipo de Movimento' : 'Novo Tipo de Movimento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              maxLength={50}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Digite o nome do tipo de movimento"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              {typeName.length}/50 caracteres
            </p>
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
              {isLoading ? (movementType ? 'Salvando...' : 'Criando...') : (movementType ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};