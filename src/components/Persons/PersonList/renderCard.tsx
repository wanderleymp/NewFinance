import React from 'react';
import { Building2, FileText, Mail, MapPin, UserCircle2, Users } from 'lucide-react';
import { Person } from '../../../types/person';

export const renderPersonCard = (person: Person) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      {person.person_type_id === 1 ? (
        <UserCircle2 className="w-5 h-5 text-blue-500" />
      ) : (
        <Building2 className="w-5 h-5 text-purple-500" />
      )}
      <div>
        <h3 className="font-medium">{person.full_name}</h3>
        {person.fantasy_name && (
          <p className="text-sm text-gray-500">{person.fantasy_name}</p>
        )}
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <FileText className="w-4 h-4 text-blue-500" />
        <span>{person.documents[0]?.value || '-'}</span>
      </div>

      {person.contacts.length > 0 && (
        <div className="flex flex-col gap-1">
          {person.contacts.slice(0, 2).map((contact, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>{contact.value}</span>
            </div>
          ))}
          {person.contacts.length > 2 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>+{person.contacts.length - 2} contatos</span>
            </div>
          )}
        </div>
      )}

      {person.address && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-red-500" />
          <span>{`${person.address.city}/${person.address.state}`}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-blue-500" />
        <span>{person.user_count || 0} usuários</span>
      </div>
    </div>
  </div>
);