import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { MovementType } from '../../types/movement-type';

export const renderMovementTypeCard = (movementType: MovementType) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <ArrowDownUp className="w-5 h-5 text-blue-500" />
      <h3 className="font-medium">{movementType.type_name}</h3>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="text-sm">
        <p className="text-gray-500">Movimentações</p>
        <p className="font-medium">{movementType._count?.movements || 0}</p>
      </div>
      <div className="text-sm">
        <p className="text-gray-500">Status</p>
        <p className="font-medium">{movementType._count?.movement_statuses || 0}</p>
      </div>
    </div>
  </div>
);