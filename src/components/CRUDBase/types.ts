import { ReactNode } from 'react';

export interface BaseRecord {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MetricItem {
  title: string;
  value: string | number;
  trend?: number;
  color?: string;
  textColor?: string;
  icon?: ReactNode;
}

export interface CRUDBaseProps<T extends BaseRecord> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: any[];
  renderCard: (record: T) => ReactNode;
  metrics?: MetricItem[];
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onToggleStatus?: (record: T) => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  renderCustomActions?: (record: T) => ReactNode;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}