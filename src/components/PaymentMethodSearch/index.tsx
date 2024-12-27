import React, { useState, useCallback } from 'react';
import { PaymentMethod } from '../../types/payment-method';
import { PaymentMethodService } from '../../services/PaymentMethodService';
import { toast } from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';
import { PaymentMethodDisplay } from './PaymentMethodDisplay';
import { PaymentMethodList } from './PaymentMethodList';
import { SearchInput } from './SearchInput';

interface PaymentMethodSearchProps {
  selectedPaymentMethod: PaymentMethod | null;
  onSelect: (paymentMethod: PaymentMethod | null) => void;
  disabled?: boolean;
}

export const PaymentMethodSearch: React.FC<PaymentMethodSearchProps> = ({
  selectedPaymentMethod,
  onSelect,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PaymentMethod[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await PaymentMethodService.getPaymentMethods(1, 5, term);
      setSearchResults(response.data);
      setIsDropdownOpen(true);
    } catch (error) {
      toast.error('Erro ao buscar métodos de pagamento');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!disabled) {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch, handleSearch, disabled]);

  const handleSelect = (paymentMethod: PaymentMethod) => {
    onSelect(paymentMethod);
    setSearchTerm('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Método de Pagamento
      </label>
      
      {selectedPaymentMethod ? (
        <PaymentMethodDisplay
          paymentMethod={selectedPaymentMethod}
          onRemove={() => onSelect(null)}
          disabled={disabled}
        />
      ) : (
        <div className="relative">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            isLoading={isLoading}
            disabled={disabled}
          />

          {isDropdownOpen && searchResults.length > 0 && (
            <PaymentMethodList
              methods={searchResults}
              onSelect={handleSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};