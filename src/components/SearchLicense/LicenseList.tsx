import React from 'react';
import { Key } from 'lucide-react';
import { License } from '../../types/license';

interface LicenseListProps {
  licenses: License[];
  onSelect: (license: License) => void;
}

export const LicenseList: React.FC<LicenseListProps> = ({
  licenses,
  onSelect,
}) => (
  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
    {licenses.map((license) => (
      <button
        key={license.id}
        type="button"
        onClick={() => onSelect(license)}
        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
      >
        <Key className="w-5 h-5 text-blue-500" />
        <div>
          <p className="font-medium">{license.name}</p>
          <p className="text-sm text-gray-500">{license.persons.full_name}</p>
        </div>
      </button>
    ))}
  </div>
);