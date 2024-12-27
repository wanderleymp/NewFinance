import React from 'react';
import { Users, Calendar, Building2 } from 'lucide-react';
import { License } from '../../types/license';

export const renderLicenseCard = (license: License) => (
  <div className="space-y-3">
    <div>
      <h3 className="font-medium">{license.name}</h3>
      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
        license.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {license.status === 'active' ? 'Ativa' : 'Inativa'}
      </span>
    </div>

    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <Building2 className="w-4 h-4 text-purple-500" />
        <div>
          <p>{license.persons.full_name}</p>
          {license.persons.person_documents.map((doc, index) => (
            doc.document_types.description === 'CNPJ' && (
              <p key={index} className="text-gray-500">{doc.document_value}</p>
            )
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-gray-500" />
        <div>
          <p>Início: {new Date(license.start_date).toLocaleDateString('pt-BR')}</p>
          <p>Término: {license.end_date ? new Date(license.end_date).toLocaleDateString('pt-BR') : '-'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-blue-500" />
        <span>{license.user_count} usuários</span>
      </div>
    </div>
  </div>
);