import React from 'react';
import { Edit2, Trash2, Share2, Power } from 'lucide-react';
import { BaseRecord } from './types';

interface CardViewProps<T extends BaseRecord> {
  data: T[];
  renderCard: (record: T) => React.ReactNode;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onToggleStatus?: (record: T) => void;
  renderCustomActions?: (record: T) => React.ReactNode;
}

export function CardView<T extends BaseRecord>({
  data,
  renderCard,
  onEdit,
  onDelete,
  onToggleStatus,
  renderCustomActions,
}: CardViewProps<T>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map(record => (
        <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            {renderCard(record)}
            <div className="flex items-center gap-2">
              {onEdit && (
                <button 
                  onClick={() => onEdit(record)}
                  className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4 text-orange-500 group-hover:text-orange-600" />
                </button>
              )}
              {onToggleStatus && (
                <button 
                  onClick={() => onToggleStatus(record)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
                  title="Ativar/Desativar"
                >
                  <Power className="w-4 h-4 text-gray-500 group-hover:text-gray-600" />
                </button>
              )}
              <button 
                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                title="Compartilhar"
              >
                <Share2 className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
              </button>
              {onDelete && (
                <button 
                  onClick={() => onDelete(record)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                </button>
              )}
              {renderCustomActions && renderCustomActions(record)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}