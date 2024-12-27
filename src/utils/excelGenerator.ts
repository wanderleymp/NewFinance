import * as XLSX from 'xlsx';
import { Person } from '../types/person';
import { License } from '../types/license';

export const generatePersonExcel = async (data: Person[]): Promise<Blob> => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(person => ({
      'Nome': person.full_name,
      'Nome Fantasia': person.fantasy_name || '',
      'Tipo': person.person_type_id === 1 ? 'Pessoa Física' : 'Pessoa Jurídica',
      'Documentos': person.documents.map(doc => doc.value).join(', '),
      'Contatos': person.contacts.map(contact => contact.value).join(', '),
      'Cidade': person.address?.city || '',
      'Estado': person.address?.state || '',
      'CEP': person.address?.postal_code || '',
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pessoas');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const generateLicenseExcel = async (data: License[]): Promise<Blob> => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(license => ({
      'Nome': license.name,
      'Status': license.status === 'active' ? 'Ativa' : 'Inativa',
      'Data Início': new Date(license.start_date).toLocaleDateString('pt-BR'),
      'Data Término': new Date(license.end_date).toLocaleDateString('pt-BR'),
      'Usuários': license.user_count,
      'Timezone': license.timezone,
      'Criado em': new Date(license.created_at).toLocaleDateString('pt-BR'),
      'Atualizado em': new Date(license.updated_at).toLocaleDateString('pt-BR'),
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Licenças');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};