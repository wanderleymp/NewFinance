import type { Meta, StoryObj } from '@storybook/react';
import { NewContractList } from './NewContractList';
import { NewContractService } from '../services/newContractService';
import { Contract } from '../types/contract';

const meta: Meta<typeof NewContractList> = {
  title: 'Contracts/NewContractList',
  component: NewContractList,
  parameters: {
    layout: 'fullwidth'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof NewContractList>;

// Mock de dados para o Storybook
const mockContracts: Contract[] = [
  {
    id: '1',
    name: 'Contrato de Serviço A',
    value: 5000,
    status: 'ativo',
    startDate: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Contrato de Consultoria B',
    value: 7500,
    status: 'ativo',
    startDate: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Contrato de Manutenção C',
    value: 3000,
    status: 'inativo',
    startDate: new Date().toISOString()
  }
];

// Mock do serviço de contratos
const mockContractService = NewContractService.getInstance();
jest.spyOn(mockContractService, 'listRecurring').mockResolvedValue({
  data: mockContracts,
  meta: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 3,
    itemsPerPage: 10
  }
});

export const Default: Story = {
  render: () => <NewContractList />,
  parameters: {
    backgrounds: {
      default: 'light'
    }
  }
};

export const Loading: Story = {
  render: () => {
    // Simular estado de carregamento
    jest.spyOn(mockContractService, 'listRecurring').mockImplementation(() => 
      new Promise(() => {}) // Promessa que nunca resolve, simulando carregamento
    );
    return <NewContractList />;
  }
};

export const Error: Story = {
  render: () => {
    // Simular estado de erro
    jest.spyOn(mockContractService, 'listRecurring').mockRejectedValue(
      new Error('Erro ao carregar contratos')
    );
    return <NewContractList />;
  }
};

export const EmptyState: Story = {
  render: () => {
    jest.spyOn(mockContractService, 'listRecurring').mockResolvedValue({
      data: [],
      meta: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10
      }
    });
    return <NewContractList />;
  }
};
