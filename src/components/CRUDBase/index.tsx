import React, { useEffect } from 'react';
import { BaseRecord, CRUDBaseProps } from './types';
import { MetricsHeader } from './components/MetricsHeader';
import { ActionHeader } from './components/ActionHeader';
import { TableView } from './TableView';
import { CardView } from './CardView';
import { Pagination } from './components/Pagination';

export function CRUDBase<T extends BaseRecord>({
  title,
  subtitle,
  data,
  columns,
  renderCard,
  metrics,
  onAdd,
  onEdit,
  onDelete,
  onToggleStatus,
  onExportExcel,
  onExportPDF,
  renderCustomActions,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  pagination,
  onPageChange,
}: CRUDBaseProps<T>) {
  useEffect(() => {
    // Initial data load is handled by the parent component
  }, []);

  return (
    <div className="space-y-6">
      {metrics && metrics.length > 0 && (
        <MetricsHeader metrics={metrics} />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <ActionHeader
          title={title}
          subtitle={subtitle}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onAdd={onAdd}
          onExportExcel={onExportExcel}
          onExportPDF={onExportPDF}
        />

        <div className="p-6">
          {viewMode === 'table' ? (
            <TableView
              data={data}
              columns={columns}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              renderCustomActions={renderCustomActions}
            />
          ) : (
            <CardView
              data={data}
              renderCard={renderCard}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              renderCustomActions={renderCustomActions}
            />
          )}
        </div>

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}