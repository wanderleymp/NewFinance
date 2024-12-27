import React, { useState, useEffect } from 'react';
import { X, Plus, Mail, Phone } from 'lucide-react';
import { Person, Contact } from '../../../types/person';
import { PersonService } from '../../../services/PersonService';
import { toast } from 'react-hot-toast';

interface PersonContactsModalProps {
  person: Person;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const PersonContactsModal: React.FC<PersonContactsModalProps> = ({
  person,
  isOpen,
  onClose,
  onSave,
}) => {
  const [contacts, setContacts] = useState<Contact[]>(person.contacts);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    type_id: 1,
    value: '',
    name: '',
  });

  const handleAddContact = async () => {
    try {
      if (!newContact.value) {
        toast.error('Preencha o valor do contato');
        return;
      }

      await PersonService.addContact(person.id, newContact);
      toast.success('Contato adicionado com sucesso');
      setNewContact({ type_id: 1, value: '', name: '' });
      onSave();
    } catch (error) {
      toast.error('Erro ao adicionar contato');
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      await PersonService.deleteContact(person.id, contactId);
      toast.success('Contato removido com sucesso');
      setContacts(contacts.filter(c => c.id !== contactId));
      onSave();
    } catch (error) {
      toast.error('Erro ao remover contato');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contatos</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Adicionar Novo Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <select
                  value={newContact.type_id}
                  onChange={(e) => setNewContact({ ...newContact, type_id: Number(e.target.value) })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={1}>Email</option>
                  <option value={2}>Telefone</option>
                  <option value={3}>WhatsApp</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={newContact.value}
                  onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                  placeholder="Valor do contato"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newContact.name || ''}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Nome do contato (opcional)"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddContact}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Contato</span>
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Contatos Cadastrados</h3>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {contact.type_id === 1 ? (
                    <Mail className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Phone className="w-5 h-5 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">{contact.value}</p>
                    {contact.name && (
                      <p className="text-sm text-gray-500">{contact.name}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => contact.id && handleDeleteContact(contact.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};