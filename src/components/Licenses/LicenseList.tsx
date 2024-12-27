import React, { useState } from 'react';
import { Building2, Edit2, Users } from 'lucide-react';
import { CRUDBase } from '../CRUDBase';
import { useLicenses } from './hooks/useLicenses';
import { columns } from './columns';
import { renderLicenseCard } from './renderCard';
import { generateLicensePDF } from '../../utils/pdfGenerator';
import { generateLicenseExcel } from '../../utils/excelGenerator';
import { toast } from 'react-hot-toast';
import { LicenseForm } from './LicenseForm';
import { LicenseUsersModal } from './LicenseUsersModal';
import { License } from '../../types/license';

export const LicenseList: React.FC = () => {
  const {
    licenses,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    metrics,
    activeFilter,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleToggleStatus,
    handleActiveFilterChange,
    loadData,
  } = useLicenses();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);

  const handleEdit = (license: License) => {
    setSelectedLicense(license);
    setIsFormOpen(true);
  };

  const handleViewUsers = (license: License) => {
    setSelectedLicense(license);
    setIsUsersModalOpen(true);
  };

  const handleExportExcel = async () => {
    try {
      const blob = await generateLicenseExcel(licenses);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'licenses.xlsx';
      link.click();
      toast.success('Exportação concluída');
    } catch (error) {
      toast.error('Erro na exportação');
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await generateLicensePDF(licenses);
      const url = URL.createObjectURL(blob);
      window.open(url);
      toast.success('PDF gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedLicense(null);
  };

  const renderCustomActions = (license: License) => (
    <>
      <button
        onClick={() => handleViewUsers(license)}
        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
        title="Ver Usuários"
      >
        <Users className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
      </button>
      <button
        onClick={() => handleEdit(license)}
        className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
        title="Editar"
      >
        <Edit2 className="w-4 h-4 text-orange-500 group-hover:text-orange-600" />
      </button>
    </>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Nova Licença</span>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleActiveFilterChange('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => handleActiveFilterChange('true')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'true'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Ativas
          </button>
          <button
            onClick={() => handleActiveFilterChange('false')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'false'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Inativas
          </button>
        </div>

        <CRUDBase
          title="Gerenciamento de Licenças"
          subtitle="Gerencie as licenças do sistema"
          data={licenses}
          columns={columns}
          renderCard={renderLicenseCard}
          metrics={metrics}
          onToggleStatus={handleToggleStatus}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          renderCustomActions={renderCustomActions}
        />
      </div>

      <LicenseForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={() => {
          loadData(1);
          handleCloseForm();
        }}
        license={selectedLicense}
      />

      {selectedLicense && (
        <LicenseUsersModal
          license={selectedLicense}
          isOpen={isUsersModalOpen}
          onClose={() => {
            setIsUsersModalOpen(false);
            setSelectedLicense(null);
          }}
        />
      )}
    </>
  );
};