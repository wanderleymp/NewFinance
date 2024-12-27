import React from 'react';
import { Key, X } from 'lucide-react';
import { License } from '../../types/license';

interface LicenseDisplayProps {
  license: License;
  onRemove: () => void;
  disabled?: boolean;
}

export const LicenseDisplay: React.FC<LicenseDisplayProps> = ({
  license,
  onRemove,
  disabled = false
}) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      <Key className="w-5 h-5 text-blue-500" />
      <div>
        <p className="font-medium">{license.name}</p>
        <p className="text-sm text-gray-500">{license.persons.full_name}</p>
      </div>
    </div>
    {!disabled && (
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        aria-label="Remover licença selecionada"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);