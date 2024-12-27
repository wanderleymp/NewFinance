import React from 'react';
import { Building2, Search } from 'lucide-react';
import { Person } from '../../../../types/person';

interface MainSectionProps {
  formData: Partial<Person>;
  setFormData: (data: Partial<Person>) => void;
  onCNPJSearch: (cnpj: string) => Promise<void>;
  isLoading: boolean;
}

export const MainSection: React.FC<MainSectionProps> = ({
  formData,
  setFormData,
  onCNPJSearch,
  isLoading,
}) => {
  const handleCNPJSearch = () => {
    const cnpj = formData.documents?.find(d => d.type_id === 2)?.value;
    if (cnpj) {
      onCNPJSearch(cnpj);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Dados Principais</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF/CNPJ
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.documents?.[0]?.value || ''}
              onChange={(e) => setFormData({
                ...formData,
                documents: [{ type_id: formData.person_type_id === 1 ? 1 : 2, value: e.target.value }],
              })}
              className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder={formData.person_type_id === 1 ? '000.000.000-00' : '00.000.000/0000-00'}
            />
            {formData.person_type_id === 2 && (
              <button
                type="button"
                onClick={handleCNPJSearch}
                disabled={isLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Pessoa
          </label>
          <select
            value={formData.person_type_id}
            onChange={(e) => setFormData({ ...formData, person_type_id: Number(e.target.value) })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={1}>Pessoa Física</option>
            <option value={2}>Pessoa Jurídica</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            value={formData.full_name || ''}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {formData.person_type_id === 2 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Fantasia
            </label>
            <input
              type="text"
              value={formData.fantasy_name || ''}
              onChange={(e) => setFormData({ ...formData, fantasy_name: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};