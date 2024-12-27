import React, { useState, useCallback } from 'react';
import { Search, Package2, X } from 'lucide-react';
import { Service } from '../../types/service';
import { ServiceService } from '../../services/ServiceService';
import { toast } from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';

interface ServiceSearchProps {
  selectedService: Service | null;
  onSelect: (service: Service | null) => void;
  disabled?: boolean;
}

export const ServiceSearch: React.FC<ServiceSearchProps> = ({
  selectedService,
  onSelect,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Service[]>([]);
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
      const response = await ServiceService.getServices(1, 5, true, term);
      setSearchResults(response.data);
      setIsDropdownOpen(true);
    } catch (error) {
      toast.error('Erro ao buscar serviços');
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

  const handleSelect = (service: Service) => {
    onSelect(service);
    setSearchTerm('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Serviço
      </label>
      
      {selectedService ? (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Package2 className="w-5 h-5 text-blue-500" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{selectedService.name}</p>
                <span className="text-sm text-gray-500">({selectedService.code})</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">{selectedService.description}</p>
                <span className="font-medium text-green-600">
                  {formatPrice(selectedService.price)}
                </span>
              </div>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, código ou descrição"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10 pr-4 py-2"
                disabled={disabled}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                </div>
              )}
            </div>
          </div>

          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
              {searchResults.map((service) => (
                <button
                  key={service.item_id}
                  type="button"
                  onClick={() => handleSelect(service)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Package2 className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{service.name}</p>
                      <span className="text-sm text-gray-500">({service.code})</span>
                    </div>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                  <span className="font-medium text-green-600">
                    {formatPrice(service.price)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};