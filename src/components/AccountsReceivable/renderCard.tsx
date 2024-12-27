import React from 'react';
import { AccountReceivable } from '../../types/accounts-receivable';

export const renderAccountReceivableCard = (account: AccountReceivable) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">{account.full_name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500">
            Vencimento: {account.due_date.split('T')[0]}
          </span>
        </div>
      </div>
      <span 
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          account.status === 'Pendente' 
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}
      >
        {account.status}
      </span>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Valor:</span>
        <span className="font-medium">
          {parseFloat(account.value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </span>
      </div>

      {account.days_overdue > 0 && (
        <div className="flex items-center justify-between text-red-600">
          <span className="text-sm">Dias em Atraso:</span>
          <span className="font-medium">{account.days_overdue}</span>
        </div>
      )}
    </div>
  </div>
);