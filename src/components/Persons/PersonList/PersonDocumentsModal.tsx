import React, { useState } from 'react';
import { X, FileText, Plus, Trash2 } from 'lucide-react';
import { Person, Document } from '../../../types/person';
import { PersonService } from '../../../services/PersonService';
import { toast } from 'react-hot-toast';

interface PersonDocumentsModalProps {
  person: Person;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const PersonDocumentsModal: React.FC<PersonDocumentsModalProps> = ({
  person,
  isOpen,
  onClose,
  onSave,
}) => {
  const [documents, setDocuments] = useState<Document[]>(person.documents);
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    type_id: 1,
    value: '',
  });

  const handleAddDocument = async () => {
    try {
      if (!newDocument.value) {
        toast.error('Digite o valor do documento');
        return;
      }

      await PersonService.addDocument(person.id, newDocument);
      toast.success('Documento adicionado com sucesso');
      setNewDocument({ type_id: 1, value: '' });
      onSave();
    } catch (error) {
      toast.error('Erro ao adicionar documento');
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await PersonService.deleteDocument(person.id, documentId);
      toast.success('Documento removido com sucesso');
      setDocuments(documents.filter(d => d.id !== documentId));
      onSave();
    } catch (error) {
      toast.error('Erro ao remover documento');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold">Documentos</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Adicionar Novo Documento</h3>
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
                  placeholder="Valor do documento"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddDocument}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Documento</span>
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Documentos Cadastrados</h3>
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{document.value}</p>
                  </div>
                </div>
                <button
                  onClick={() => document.id && handleDeleteDocument(document.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};