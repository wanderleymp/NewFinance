import React, { useState, useCallback, useEffect } from 'react';
import { License } from '../../types/license';
import { LicenseService } from '../../services/LicenseService';
import { toast } from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';
import { LicenseDisplay } from './LicenseDisplay';
import { LicenseList } from './LicenseList';
import { SearchInput } from './SearchInput';
import { useAuth } from '../../contexts/AuthContext';

interface SearchLicenseProps {
  selectedLicense: License | null;
  onSelect: (license: License | null) => void;
  disabled?: boolean;
}

export const SearchLicense: React.FC<SearchLicenseProps> = ({
  selectedLicense,
  onSelect,
  disabled = false
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<License[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const loadInitialLicense = useCallback(async () => {
    if (!selectedLicense) {
      try {
        setIsLoading(true);
        const response = await LicenseService.getLicenses(1, 1);
        if (response.data.length > 0) {
          onSelect(response.data[0]);
        }
      } catch (error) {
        console.error('Error loading initial license:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedLicense, onSelect]);

  useEffect(() => {
    loadInitialLicense();
  }, [loadInitialLicense]);

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await LicenseService.getLicenses(1, 5, 'true', term);
      setSearchResults(response.data);
      setIsDropdownOpen(true);
    } catch (error) {
      toast.error('Erro ao buscar licenças');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!disabled) {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch, handleSearch, disabled]);

  const handleSelect = (license: License) => {
    onSelect(license);
    setSearchTerm('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  // If user has only one license, don't show search
  if (user?.person?.licenses?.length === 1) {
    return null;
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Licença
      </label>
      
      {selectedLicense ? (
        <LicenseDisplay
          license={selectedLicense}
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
            <LicenseList
              licenses={searchResults}
              onSelect={handleSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};