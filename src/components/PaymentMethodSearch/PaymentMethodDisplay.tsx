import React from 'react';
import { CreditCard, X } from 'lucide-react';
import { PaymentMethod } from '../../types/payment-method';

interface PaymentMethodDisplayProps {
  paymentMethod: PaymentMethod;
  onRemove: () => void;
  disabled?: boolean;
}

export const PaymentMethodDisplay: React.FC<PaymentMethodDisplayProps> = ({
  paymentMethod,
  onRemove,
  disabled = false
}) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      <CreditCard className="w-5 h-5 text-blue-500" />
      <div>
        <p className="font-medium">{paymentMethod.name}</p>
        {paymentMethod.description && (
          <p className="text-sm text-gray-500">{paymentMethod.description}</p>
        )}
      </div>
    </div>
    {!disabled && (
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        aria-label="Remover método de pagamento"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);