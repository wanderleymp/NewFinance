import React from 'react';
import { X, UserCircle2, Mail, MapPin, FileCheck, Building2 } from 'lucide-react';
import { Person } from '../../types/person';

interface PersonDetailModalProps {
  person: Person;
  isOpen: boolean;
  onClose: () => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle2 className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold">{person.full_name}</h2>
              {person.fantasy_name && (
                <p className="text-sm text-gray-500">{person.fantasy_name}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Informações Básicas
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {person.person_type_id === 1 ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </span>
                </div>

                {person.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{doc.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Contatos
              </h3>
              
              <div className="space-y-2">
                {person.contacts.map((contact, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      {contact.name && `${contact.name}: `}{contact.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {person.address && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Endereço
              </h3>
              
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p>{`${person.address.street}, ${person.address.number}`}</p>
                  {person.address.complement && (
                    <p>{person.address.complement}</p>
                  )}
                  <p>{`${person.address.neighborhood} - ${person.address.city}/${person.address.state}`}</p>
                  <p>{`CEP: ${person.address.postal_code}`}</p>
                  {person.address.reference && (
                    <p className="text-gray-500">{`Referência: ${person.address.reference}`}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {person.person_type_id === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Informações Adicionais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">QSA</h4>
                  <p className="text-sm text-gray-600">
                    Informações do Quadro Societário
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">CNAEs</h4>
                  <p className="text-sm text-gray-600">
                    Atividades Econômicas
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};