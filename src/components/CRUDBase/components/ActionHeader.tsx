import React from 'react';
import { Search, Plus, FileSpreadsheet, FileText, LayoutGrid, Table } from 'lucide-react';

interface ActionHeaderProps {
  title: string;
  subtitle?: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onAdd?: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
}

export const ActionHeader: React.FC<ActionHeaderProps> = ({
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAdd,
  onExportExcel,
  onExportPDF,
}) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 w-full md:w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            {onAdd && (
              <button 
                onClick={onAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            )}
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border border-emerald-200 group"
                title="Exportar para Excel"
              >
                <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border border-red-200 group"
                title="Exportar para PDF"
              >
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
            <div className="border-l border-gray-200 h-6 mx-2" />
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border ${
                viewMode === 'grid' 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50 border-gray-200'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border ${
                viewMode === 'table' 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50 border-gray-200'
              }`}
            >
              <Table className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};