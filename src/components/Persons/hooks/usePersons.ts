import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Person } from '../../../types/person';
import { PersonService } from '../../../services/PersonService';
import { useCRUDBase } from '../../CRUDBase/hooks/useCRUDBase';
import { useAuth } from '../../../contexts/AuthContext';

export const usePersons = () => {
  const { user } = useAuth();

  const fetchPersons = useCallback(async (page: number, limit: number, search?: string) => {
    try {
      return await PersonService.getPersons(page, limit, search);
    } catch (error) {
      toast.error('Erro ao carregar pessoas');
      throw error;
    }
  }, []);

  const {
    data: persons,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleItemsPerPageChange,
    loadData,
  } = useCRUDBase<Person>({
    fetchData: fetchPersons,
  });

  const handleToggleStatus = async (person: Person) => {
    try {
      await PersonService.updatePerson(person.id, {
        ...person,
        status: person.status === 'active' ? 'inactive' : 'active',
      });
      toast.success('Status atualizado com sucesso');
      loadData(pagination.currentPage);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleCreatePersonByCNPJ = async (cnpj: string) => {
    try {
      if (!user?.person?.licenses?.[0]?.id) {
        throw new Error('Licença não encontrada');
      }

      await PersonService.createPersonByCNPJ(cnpj, user.person.licenses[0].id);
      toast.success('Pessoa jurídica criada com sucesso');
      loadData(1);
    } catch (error) {
      toast.error('Erro ao criar pessoa jurídica');
      throw error;
    }
  };

  return {
    persons,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleItemsPerPageChange,
    handleToggleStatus,
    handleCreatePersonByCNPJ,
    loadData,
  };
};