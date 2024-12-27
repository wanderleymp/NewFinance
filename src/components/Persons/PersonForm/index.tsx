import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Person } from '../../../types/person';
import { PersonService } from '../../../services/PersonService';
import { MainSection } from './sections/MainSection';
import { ContactsSection } from './sections/ContactsSection';
import { DocumentsSection } from './sections/DocumentsSection';
import { AddressSection } from './sections/AddressSection';
import { CNAESection } from './sections/CNAESection';

const initialState: Partial<Person> = {
  full_name: '',
  fantasy_name: '',
  person_type_id: 1,
  documents: [],
  contacts: [],
  address: {
    postal_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil',
  },
};

export const PersonForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState<Partial<Person>>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadPerson(Number(id));
    }
  }, [id]);

  const loadPerson = async (personId: number) => {
    try {
      setIsLoading(true);
      const person = await PersonService.getPerson(personId);
      setFormData(person);
    } catch (error) {
      toast.error('Erro ao carregar dados da pessoa');
      navigate('/persons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCNPJSearch = async (cnpj: string) => {
    try {
      setIsLoading(true);
      const data = await PersonService.searchCNPJ(cnpj);
      setFormData(prev => ({
        ...prev,
        full_name: data.razao_social,
        fantasy_name: data.nome_fantasia,
        person_type_id: 2,
        address: {
          postal_code: data.cep,
          street: data.logradouro,
          number: data.numero,
          complement: data.complemento,
          neighborhood: data.bairro,
          city: data.municipio,
          state: data.uf,
          country: 'Brasil',
        },
      }));
      toast.success('Dados carregados com sucesso');
    } catch (error) {
      toast.error('Erro ao consultar CNPJ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      if (id) {
        await PersonService.updatePerson(Number(id), formData);
        toast.success('Pessoa atualizada com sucesso');
      } else {
        await PersonService.createPerson(formData);
        toast.success('Pessoa criada com sucesso');
      }
      navigate('/persons');
    } catch (error) {
      toast.error('Erro ao salvar pessoa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {id ? 'Editar Pessoa' : 'Nova Pessoa'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/persons')}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <form className="space-y-6">
        <MainSection
          formData={formData}
          setFormData={setFormData}
          onCNPJSearch={handleCNPJSearch}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <DocumentsSection
              documents={formData.documents || []}
              onChange={(documents) => setFormData({ ...formData, documents })}
            />
            <ContactsSection
              contacts={formData.contacts || []}
              onChange={(contacts) => setFormData({ ...formData, contacts })}
            />
          </div>
          <div className="space-y-6">
            <AddressSection
              address={formData.address}
              onChange={(address) => setFormData({ ...formData, address })}
            />
            {formData.person_type_id === 2 && (
              <CNAESection
                cnaes={formData.cnaes || []}
                onChange={(cnaes) => setFormData({ ...formData, cnaes })}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
};