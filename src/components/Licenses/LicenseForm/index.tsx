import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PersonSearch } from './PersonSearch';
import { Person } from '../../../types/person';
import { License } from '../../../types/license';
import { LicenseService } from '../../../services/LicenseService';

interface LicenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  license?: License;
}

export const LicenseForm: React.FC<LicenseFormProps> = ({
  isOpen,
  onClose,
  onSave,
  license,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState({
    license_name: '',
    start_date: new Date().toISOString().split('T')[0],
    timezone: 'America/Sao_Paulo'
  });

  useEffect(() => {
    if (license) {
      setFormData({
        license_name: license.name,
        start_date: license.start_date.split('T')[0],
        timezone: license.timezone
      });
      setSelectedPerson({
        id: license.person_id,
        full_name: license.persons.full_name,
        fantasy_name: license.persons.fantasy_name,
        person_type_id: 2, // Assuming it's always a company
        documents: [],
        contacts: []
      });
    }
  }, [license]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPerson) {
      toast.error('Selecione uma pessoa');
      return;
    }

    if (!formData.license_name.trim()) {
      toast.error('Digite o nome da licença');
      return;
    }

    try {
      setIsLoading(true);
      if (license) {
        await LicenseService.updateLicense(license.id, {
          license_name: formData.license_name,
          timezone: formData.timezone
        });
        toast.success('Licença atualizada com sucesso');
      } else {
        await LicenseService.createLicense({
          person_id: selectedPerson.id,
          license_name: formData.license_name,
          start_date: formData.start_date,
          timezone: formData.timezone
        });
        toast.success('Licença criada com sucesso');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(license ? 'Erro ao atualizar licença' : 'Erro ao criar licença');
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
            {license ? 'Editar Licença' : 'Nova Licença'}
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
            <PersonSearch
              selectedPerson={selectedPerson}
              onSelect={setSelectedPerson}
              disabled={!!license}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Licença
              </label>
              <input
                type="text"
                value={formData.license_name}
                onChange={(e) => setFormData({ ...formData, license_name: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Digite o nome da licença"
                required
              />
            </div>

            {!license && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                <option value="America/Manaus">America/Manaus</option>
                <option value="America/Belem">America/Belem</option>
                <option value="America/Fortaleza">America/Fortaleza</option>
              </select>
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
              {isLoading ? (license ? 'Salvando...' : 'Criando...') : (license ? 'Salvar' : 'Criar Licença')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};