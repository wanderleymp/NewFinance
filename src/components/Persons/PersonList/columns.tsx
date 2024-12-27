import { createColumnHelper } from '@tanstack/react-table';
import { Person } from '../../../types/person';
import { Building2, FileText, UserCircle2, Users } from 'lucide-react';

const columnHelper = createColumnHelper<Person>();

export const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('full_name', {
    header: 'Nome',
    cell: info => (
      <div className="flex items-center gap-2">
        {info.row.original.person_type_id === 1 ? (
          <UserCircle2 className="w-4 h-4 text-blue-500" />
        ) : (
          <Building2 className="w-4 h-4 text-purple-500" />
        )}
        <span>{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('fantasy_name', {
    header: 'Nome Fantasia',
    cell: info => info.getValue() || '-',
  }),
  columnHelper.accessor('documents', {
    header: 'Documentos',
    cell: info => (
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-500" />
        <span>{info.getValue()?.[0]?.value || '-'}</span>
      </div>
    ),
  }),
  columnHelper.accessor('address', {
    header: 'Localização',
    cell: info => {
      const address = info.getValue();
      if (!address) return <span className="text-gray-500">Endereço não cadastrado</span>;
      return `${address.city}/${address.state}`;
    },
  }),
  columnHelper.accessor('user_count', {
    header: 'Usuários',
    cell: info => (
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-500" />
        <span>{info.getValue() || 0}</span>
      </div>
    ),
  }),
];