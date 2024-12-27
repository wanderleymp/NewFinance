import React from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentMethod } from '../../types/payment-method';

interface PaymentMethodListProps {
  methods: PaymentMethod[];
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  methods,
  onSelect,
}) => (
  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
    {methods.map((method) => (
      <button
        key={method.id.toString()}
        type="button"
        onClick={() => onSelect(method)}
        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
      >
        <CreditCard className="w-5 h-5 text-blue-500" />
        <div>
          <p className="font-medium">{method.name}</p>
          {method.description && (
            <p className="text-sm text-gray-500">{method.description}</p>
          )}
        </div>
      </button>
    ))}
  </div>
);