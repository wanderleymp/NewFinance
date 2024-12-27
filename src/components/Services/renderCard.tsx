import React from 'react';
import { Package2 } from 'lucide-react';
import { Service } from '../../types/service';

export const renderServiceCard = (service: Service) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Package2 className="w-5 h-5 text-blue-500" />
      <div>
        <h3 className="font-medium">{service.name}</h3>
        <p className="text-sm text-gray-500">{service.code}</p>
      </div>
    </div>

    <div className="space-y-2">
      <p className="text-sm text-gray-600">{service.description}</p>

      <div className="flex items-center justify-between">
        <span className="font-medium text-green-600">
          {parseFloat(service.price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {service.active ? 'Ativo' : 'Inativo'}
        </span>
      </div>
    </div>
  </div>
);