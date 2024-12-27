import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { MovementStatus } from '../../types/movement-status';

export const renderMovementStatusCard = (status: MovementStatus) => (
  <div className="space-y-3">
    <div>
      <h3 className="font-medium">{status.status_name}</h3>
      {status.description && (
        <p className="text-sm text-gray-500">{status.description}</p>
      )}
    </div>

    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <ArrowDownUp className="w-4 h-4 text-blue-500" />
        <span>{status.movement_types.type_name}</span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status.active ? 'Ativo' : 'Inativo'}
        </span>
        {status.is_final && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Status Final
          </span>
        )}
      </div>
    </div>
  </div>
);
