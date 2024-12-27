import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, UserCircle2 } from 'lucide-react';
import { CRUDBase } from '../../CRUDBase';
import { usePersons } from '../hooks/usePersons';
import { PersonCNPJModal } from './PersonCNPJModal';
import { PersonContactsModal } from './PersonContactsModal';
import { PersonLocationModal } from './PersonLocationModal';
import { PersonDocumentsModal } from './PersonDocumentsModal';
import { Person } from '../../../types/person';
import { generatePersonPDF } from '../../../utils/pdfGenerator';
import { generatePersonExcel } from '../../../utils/excelGenerator';
import { toast } from 'react-hot-toast';
import { columns } from './columns';
import { renderPersonCard } from './renderCard';

export const PersonList: React.FC = () => {
  const navigate = useNavigate();
  const {
    persons,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleToggleStatus,
    handleCreatePersonByCNPJ,
    loadData,
  } = usePersons();

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isCNPJModalOpen, setIsCNPJModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handleEdit = (person: Person) => {
    navigate(`/persons/${person.id}/edit`);
  };

  const handleExportExcel = async () => {
    try {
      const blob = await generatePersonExcel(persons);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pessoas.xlsx';
      link.click();
      toast.success('Exportação concluída');
    } catch (error) {
      toast.error('Erro na exportação');
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await generatePersonPDF(persons);
      const url = URL.createObjectURL(blob);
      window.open(url);
      toast.success('PDF gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    }
  };

  const metrics = [
    {
      title: 'Total de Pessoas',
      value: pagination.totalItems,
      trend: 12.5,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
    },
    {
      title: 'Pessoas Físicas',
      value: persons.filter(p => p.person_type_id === 1).length,
      trend: 8.2,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-white',
    },
    {
      title: 'Pessoas Jurídicas',
      value: persons.filter(p => p.person_type_id === 2).length,
      trend: -2.1,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white',
    },
  ];

  return (
    <>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => navigate('/persons/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <UserCircle2 className="w-4 h-4" />
          <span>Nova Pessoa</span>
        </button>
        <button
          onClick={() => setIsCNPJModalOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          <span>Nova Pessoa (CNPJ)</span>
        </button>
      </div>

      <CRUDBase
        title="Gerenciamento de Pessoas"
        subtitle="Gerencie pessoas físicas e jurídicas"
        data={persons}
        columns={columns}
        renderCard={renderPersonCard}
        metrics={metrics}
        onEdit={handleEdit}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onToggleStatus={handleToggleStatus}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      {selectedPerson && (
        <>
          <PersonContactsModal
            person={selectedPerson}
            isOpen={isContactsModalOpen}
            onClose={() => setIsContactsModalOpen(false)}
            onSave={() => {
              setIsContactsModalOpen(false);
              loadData(pagination.currentPage);
            }}
          />
          <PersonLocationModal
            person={selectedPerson}
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            onSave={() => {
              setIsLocationModalOpen(false);
              loadData(pagination.currentPage);
            }}
          />
          <PersonDocumentsModal
            person={selectedPerson}
            isOpen={isDocumentsModalOpen}
            onClose={() => setIsDocumentsModalOpen(false)}
            onSave={() => {
              setIsDocumentsModalOpen(false);
              loadData(pagination.currentPage);
            }}
          />
        </>
      )}

      <PersonCNPJModal
        isOpen={isCNPJModalOpen}
        onClose={() => setIsCNPJModalOpen(false)}
        onSubmit={handleCreatePersonByCNPJ}
      />
    </>
  );
};