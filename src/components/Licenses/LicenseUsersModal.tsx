import React, { useState, useEffect } from 'react';
import { X, Users, Mail } from 'lucide-react';
import { License, LicenseUser } from '../../types/license';
import { LicenseService } from '../../services/LicenseService';
import { toast } from 'react-hot-toast';

interface LicenseUsersModalProps {
  license: License;
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseUsersModal: React.FC<LicenseUsersModalProps> = ({
  license,
  isOpen,
  onClose,
}) => {
  const [users, setUsers] = useState<LicenseUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        const response = await LicenseService.getLicenseUsers(license.id);
        setUsers(response);
      } catch (error) {
        toast.error('Erro ao carregar usuários da licença');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [license.id, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold">Usuários da Licença</h2>
              <p className="text-sm text-gray-500">{license.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado para esta licença
            </div>
          )}
        </div>
      </div>
    </div>
  );
};