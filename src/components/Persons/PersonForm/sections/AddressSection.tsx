import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { Address } from '../../../../types/person';
import { PersonService } from '../../../../services/PersonService';
import { toast } from 'react-hot-toast';

interface AddressSectionProps {
  address?: Address;
  onChange: (address: Address) => void;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  address = {
    postal_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil',
  },
  onChange,
}) => {
  const handleCEPSearch = async () => {
    if (!address.postal_code || address.postal_code.length !== 8) {
      toast.error('Digite um CEP válido');
      return;
    }

    try {
      const data = await PersonService.searchCEP(address.postal_code);
      onChange({
        ...address,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.cidade,
        state: data.estado,
      });
      toast.success('Endereço encontrado');
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-semibold">Endereço</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={address.postal_code}
              onChange={(e) => onChange({ ...address, postal_code: e.target.value })}
              placeholder="00000-000"
              className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleCEPSearch}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logradouro
          </label>
          <input
            type="text"
            value={address.street}
            onChange={(e) => onChange({ ...address, street: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número
          </label>
          <input
            type="text"
            value={address.number}
            onChange={(e) => onChange({ ...address, number: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complemento
          </label>
          <input
            type="text"
            value={address.complement}
            onChange={(e) => onChange({ ...address, complement: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro
          </label>
          <input
            type="text"
            value={address.neighborhood}
            onChange={(e) => onChange({ ...address, neighborhood: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => onChange({ ...address, city: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => onChange({ ...address, state: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};