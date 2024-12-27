import React from 'react';
import { Edit2, Trash2, Share2, MoreVertical } from 'lucide-react';
import { User } from '../../types/user';

interface UsersCardsProps {
  data: User[];
}

export const UsersCards: React.FC<UsersCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map(user => (
        <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.profile === 'admin' 
                    ? 'bg-purple-100 text-purple-800'
                    : user.profile === 'manager'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.profile === 'admin' ? 'Administrador' : 
                   user.profile === 'manager' ? 'Gerente' : 'Usuário'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Trash2 className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      ))}
    </div>
  );
};