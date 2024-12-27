import { createColumnHelper } from '@tanstack/react-table';
import { License } from '../../types/license';
import { Users, Calendar } from 'lucide-react';

const columnHelper = createColumnHelper<License>();

export const columns = [
  columnHelper.accessor('name', {
    header: 'Nome',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('persons', {
    header: 'Empresa',
    cell: info => {
      const person = info.getValue();
      return (
        <div className="space-y-1">
          <p className="font-medium">{person.full_name}</p>
          {person.person_documents.map((doc, index) => (
            doc.document_types.description === 'CNPJ' && (
              <p key={index} className="text-sm text-gray-500">{doc.document_value}</p>
            )
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        info.getValue() === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {info.getValue() === 'active' ? 'Ativa' : 'Inativa'}
      </span>
    ),
  }),
  columnHelper.accessor('start_date', {
    header: 'Data Início',
    cell: info => new Date(info.getValue()).toLocaleDateString('pt-BR'),
  }),
  columnHelper.accessor('end_date', {
    header: 'Data Término',
    cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString('pt-BR') : '-',
  }),
  columnHelper.accessor('user_count', {
    header: 'Usuários',
    cell: info => (
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-500" />
        <span>{info.getValue()}</span>
      </div>
    ),
  }),
];