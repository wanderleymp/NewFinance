import React, { useState, useCallback } from 'react';
import { Search, Building2, X } from 'lucide-react';
import { Person } from '../../../types/person';
import { PersonService } from '../../../services/PersonService';
import { toast } from 'react-hot-toast';
import { useDebounce } from '../../../hooks/useDebounce';

interface PersonSearchProps {
  selectedPerson: Person | null;
  onSelect: (person: Person | null) => void;
  disabled?: boolean;
}

export const PersonSearch: React.FC<PersonSearchProps> = ({
  selectedPerson,
  onSelect,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Person[]>([]);
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
      const response = await PersonService.getPersons(1, 5, term);
      setSearchResults(response.data);
      setIsDropdownOpen(true);
    } catch (error) {
      toast.error('Erro ao buscar pessoas');
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

  const handleSelect = (person: Person) => {
    onSelect(person);
    setSearchTerm('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Pessoa
      </label>
      
      {selectedPerson ? (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium">{selectedPerson.full_name}</p>
              {selectedPerson.fantasy_name && (
                <p className="text-sm text-gray-500">{selectedPerson.fantasy_name}</p>
              )}
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
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, documento ou email"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
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
              {searchResults.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => handleSelect(person)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{person.full_name}</p>
                    {person.fantasy_name && (
                      <p className="text-sm text-gray-500">{person.fantasy_name}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};