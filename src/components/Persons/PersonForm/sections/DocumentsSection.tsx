import React, { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Document } from '../../../../types/person';

interface DocumentsSectionProps {
  documents: Document[];
  onChange: (documents: Document[]) => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  onChange,
}) => {
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    type_id: 1,
    value: '',
  });

  const handleAddDocument = () => {
    if (!newDocument.value) return;
    onChange([...documents, { ...newDocument, id: Date.now() } as Document]);
    setNewDocument({ type_id: 1, value: '' });
  };

  const handleRemoveDocument = (index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Documentos</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select
              value={newDocument.type_id}
              onChange={(e) => setNewDocument({ ...newDocument, type_id: Number(e.target.value) })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={1}>CPF</option>
              <option value={2}>CNPJ</option>
              <option value={3}>RG</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              value={newDocument.value}
              onChange={(e) => setNewDocument({ ...newDocument, value: e.target.value })}
              placeholder="Número do documento"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddDocument}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Documento</span>
        </button>
      </div>

      {documents.length > 0 && (
        <div className="mt-6 space-y-4">
          {documents.map((document, index) => (
            <div
              key={document.id || index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <p className="font-medium">{document.value}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDocument(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};