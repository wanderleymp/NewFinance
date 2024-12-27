import React from 'react';
import { Building2 } from 'lucide-react';

interface CNAE {
  code: string;
  description: string;
  is_primary: boolean;
}

interface CNAESectionProps {
  cnaes: CNAE[];
  onChange: (cnaes: CNAE[]) => void;
}

export const CNAESection: React.FC<CNAESectionProps> = ({
  cnaes,
  onChange,
}) => {
  const handlePrimaryChange = (index: number) => {
    const updatedCnaes = cnaes.map((cnae, i) => ({
      ...cnae,
      is_primary: i === index,
    }));
    onChange(updatedCnaes);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-semibold">CNAEs</h2>
      </div>

      <div className="space-y-4">
        {cnaes.map((cnae, index) => (
          <div
            key={cnae.code}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{cnae.code}</p>
                {cnae.is_primary && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    Principal
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{cnae.description}</p>
            </div>
            {!cnae.is_primary && (
              <button
                type="button"
                onClick={() => handlePrimaryChange(index)}
                className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                Tornar Principal
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};