import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { CRUDBase } from '../CRUDBase';
import { UserService } from '../../services/UserService';
import { User, UsersResponse } from '../../types/user';
import { toast } from 'react-hot-toast';

const columns = [
  {
    header: 'ID',
    accessorKey: 'user_id',
  },
  {
    header: 'Username',
    accessorKey: 'username',
  },
  {
    header: 'Nome Completo',
    accessorKey: 'full_name',
  },
  {
    header: 'Licenças',
    accessorKey: 'licenses',
    cell: (info: any) => info.getValue().map((license: any) => license.name).join(', '),
  },
];

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchUsers = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response: UsersResponse = await UserService.getUsers(page, pagination.itemsPerPage);
      setUsers(response.data);
      setPagination({
        currentPage: response.meta.current_page,
        totalPages: response.meta.pages,
        totalItems: response.meta.total,
        itemsPerPage: response.meta.per_page,
      });
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user: User) => {
    try {
      await UserService.deleteUser(user.user_id);
      toast.success('Usuário excluído com sucesso');
      fetchUsers(pagination.currentPage);
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleExportExcel = () => {
    toast('Exportação para Excel em desenvolvimento', { icon: '📊' });
  };

  const handleExportPDF = () => {
    toast('Exportação para PDF em desenvolvimento', { icon: '📄' });
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Reset to first page when searching
    fetchUsers(1);
  };

  const handleViewModeChange = (mode: 'table' | 'grid') => {
    setViewMode(mode);
  };

  const renderUserCard = (user: User) => (
    <div>
      <h3 className="font-medium">{user.full_name}</h3>
      <p className="text-sm text-gray-500 mt-1">{user.username}</p>
      <div className="mt-2">
        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {user.licenses.map(license => license.name).join(', ')}
        </span>
      </div>
    </div>
  );

  const metrics = [
    {
      title: 'Total de Usuários',
      value: pagination.totalItems,
      trend: 12.5,
      color: 'bg-white border border-gray-200',
    },
    {
      title: 'Usuários Ativos',
      value: Math.floor(pagination.totalItems * 0.85),
      trend: 8.2,
      color: 'bg-white border border-gray-200',
    },
    {
      title: 'Taxa de Ativação',
      value: '85%',
      trend: -2.1,
      color: 'bg-white border border-gray-200',
    },
  ];

  return (
    <CRUDBase
      title="Gerenciamento de Usuários"
      subtitle="Gerencie os usuários do sistema"
      data={users}
      columns={columns}
      renderCard={renderUserCard}
      metrics={metrics}
      onAdd={() => toast('Adicionar usuário em desenvolvimento', { icon: '🔨' })}
      onEdit={(user: User) => toast(`Editar usuário ${user.username}`, { icon: '✏️' })}
      onDelete={handleDelete}
      onExportExcel={handleExportExcel}
      onExportPDF={handleExportPDF}
      searchTerm={searchTerm}
      onSearchChange={handleSearch}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      pagination={pagination}
      onPageChange={handlePageChange}
      isLoading={isLoading}
    />
  );
};