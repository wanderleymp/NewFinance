import React from 'react';
import { PaymentMethod } from '../../types/payment-method';

export const renderPaymentMethodCard = (paymentMethod: PaymentMethod) => (
  <div className="space-y-2">
    <div>
      <h3 className="font-medium">{paymentMethod.name}</h3>
      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
        paymentMethod.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {paymentMethod.active ? 'Ativo' : 'Inativo'}
      </span>
    </div>

    <p className="text-sm text-gray-600">{paymentMethod.description}</p>
  </div>
);