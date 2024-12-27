import { jsPDF } from 'jspdf';
import { Person } from '../types/person';
import { License } from '../types/license';

export const generatePersonPDF = async (data: Person | Person[]): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Relatório de Pessoas', 20, 20);
  
  if (Array.isArray(data)) {
    // Generate list report
    doc.setFontSize(12);
    let y = 40;
    
    data.forEach((person, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(`${index + 1}. ${person.full_name}`, 20, y);
      doc.setFontSize(10);
      doc.text(`Tipo: ${person.person_type_id === 1 ? 'Pessoa Física' : 'Pessoa Jurídica'}`, 25, y + 5);
      if (person.documents[0]) {
        doc.text(`Documento: ${person.documents[0].value}`, 25, y + 10);
      }
      doc.setFontSize(12);
      y += 20;
    });
  } else {
    // Generate individual report
    const person = data;
    doc.setFontSize(16);
    doc.text(person.full_name, 20, 40);
    
    doc.setFontSize(12);
    doc.text(`Tipo: ${person.person_type_id === 1 ? 'Pessoa Física' : 'Pessoa Jurídica'}`, 20, 50);
    
    let y = 60;
    
    // Documents
    if (person.documents.length > 0) {
      doc.text('Documentos:', 20, y);
      y += 10;
      person.documents.forEach(doc => {
        doc.text(`- ${doc.value}`, 25, y);
        y += 5;
      });
    }
    
    // Contacts
    if (person.contacts.length > 0) {
      y += 5;
      doc.text('Contatos:', 20, y);
      y += 10;
      person.contacts.forEach(contact => {
        doc.text(`- ${contact.value}`, 25, y);
        y += 5;
      });
    }
    
    // Address
    if (person.address) {
      y += 5;
      doc.text('Endereço:', 20, y);
      y += 10;
      doc.text(`${person.address.street}, ${person.address.number}`, 25, y);
      y += 5;
      if (person.address.complement) {
        doc.text(person.address.complement, 25, y);
        y += 5;
      }
      doc.text(`${person.address.neighborhood} - ${person.address.city}/${person.address.state}`, 25, y);
      y += 5;
      doc.text(`CEP: ${person.address.postal_code}`, 25, y);
    }
  }
  
  return doc.output('blob');
};

export const generateLicensePDF = async (data: License[]): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Relatório de Licenças', 20, 20);
  
  doc.setFontSize(12);
  let y = 40;
  
  data.forEach((license, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(14);
    doc.text(`${index + 1}. ${license.name}`, 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.text(`Status: ${license.status === 'active' ? 'Ativa' : 'Inativa'}`, 25, y);
    y += 5;
    
    doc.text(`Início: ${new Date(license.start_date).toLocaleDateString('pt-BR')}`, 25, y);
    y += 5;
    
    doc.text(`Término: ${new Date(license.end_date).toLocaleDateString('pt-BR')}`, 25, y);
    y += 5;
    
    doc.text(`Usuários: ${license.user_count}`, 25, y);
    y += 5;
    
    doc.text(`Timezone: ${license.timezone}`, 25, y);
    y += 15;
  });
  
  return doc.output('blob');
};