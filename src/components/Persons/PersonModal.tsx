import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Person } from '../../types/person';
import { PersonService } from '../../services/PersonService';
import { toast } from 'react-hot-toast';

interface PersonModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  person,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Person>>({
    full_name: '',
    fantasy_name: '',
    person_type_id: 1,
    documents: [],
    contacts: [],
  });

  useEffect(() => {
    if (person) {
      setFormData(person);
    }
  }, [person]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (person) {
        await PersonService.updatePerson(person.id, formData);
        toast.success('Pessoa atualizada com sucesso');
      } else {
        await PersonService.createPerson(formData);
        toast.success('Pessoa criada com sucesso');
      }
      onSave();
    } catch (error) {
      toast.error('Erro ao salvar pessoa');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {person ? 'Editar Pessoa' : 'Nova Pessoa'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={formData.fantasy_name || ''}
                onChange={(e) => setFormData({ ...formData, fantasy_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Pessoa
              </label>
              <select
                value={formData.person_type_id}
                onChange={(e) => setFormData({ ...formData, person_type_id: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value={1}>Pessoa Física</option>
                <option value={2}>Pessoa Jurídica</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};