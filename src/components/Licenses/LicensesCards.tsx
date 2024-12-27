import React from 'react';
import { Edit2, Trash2, Share2, Users, Power } from 'lucide-react';
import { License } from '../../types/license';

interface LicensesCardsProps {
  data: License[];
}

export const LicensesCards: React.FC<LicensesCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map(license => (
        <div key={license.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{license.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  license.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {license.status === 'active' ? 'Ativa' : 'Inativa'}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {license.userCount} usuários
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="p-1.5 hover:bg-blue-50 rounded-lg group"
                title="Visualizar Usuários"
              >
                <Users className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
              </button>
              <button 
                className="p-1.5 hover:bg-purple-50 rounded-lg group"
                title="Editar"
              >
                <Edit2 className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
              </button>
              <button 
                className="p-1.5 hover:bg-green-50 rounded-lg group"
                title="Compartilhar"
              >
                <Share2 className="w-4 h-4 text-green-600 group-hover:text-green-700" />
              </button>
              <button 
                className="p-1.5 hover:bg-yellow-50 rounded-lg group"
                title={license.status === 'active' ? 'Desativar' : 'Ativar'}
              >
                <Power className="w-4 h-4 text-yellow-600 group-hover:text-yellow-700" />
              </button>
              <button 
                className="p-1.5 hover:bg-red-50 rounded-lg group"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>Início: {new Date(license.startDate).toLocaleDateString('pt-BR')}</p>
            <p>Término: {new Date(license.endDate).toLocaleDateString('pt-BR')}</p>
            <p>Timezone: {license.timezone}</p>
          </div>
        </div>
      ))}
    </div>
  );
};