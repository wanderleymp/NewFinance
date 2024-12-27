import React, { useState } from 'react';
import { Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { Contact } from '../../../../types/person';

interface ContactsSectionProps {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
}

export const ContactsSection: React.FC<ContactsSectionProps> = ({
  contacts,
  onChange,
}) => {
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    type_id: 1,
    value: '',
    name: '',
  });

  const handleAddContact = () => {
    if (!newContact.value) return;
    onChange([...contacts, { ...newContact, id: Date.now() } as Contact]);
    setNewContact({ type_id: 1, value: '', name: '' });
  };

  const handleRemoveContact = (index: number) => {
    onChange(contacts.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Contatos</h2>
      
      <div className="space-y-4">
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
          type="button"
          onClick={handleAddContact}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Contato</span>
        </button>
      </div>

      {contacts.length > 0 && (
        <div className="mt-6 space-y-4">
          {contacts.map((contact, index) => (
            <div
              key={contact.id || index}
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
                type="button"
                onClick={() => handleRemoveContact(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};