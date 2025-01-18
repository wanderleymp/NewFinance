import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import { LayoutList, LayoutGrid, X } from 'lucide-react';
import { Contract } from '../types/contract';
import { mockData } from '../services/mockData';
import { ContractFilters } from './ContractFilters';
import { ContractCard } from './ContractCard';
import { ContractTable } from './ContractTable';

export function ContractList() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => mockData.contracts,
  });

  const { 
    control, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<Partial<Contract>>({
    defaultValues: editingContract || {}
  });

  const handleEdit = (contract: Contract) => {
    console.log('🖊️ Iniciando edição do contrato:', contract);
    setEditingContract(contract);
    reset(contract);
  };

  const handleEditSubmit = (data: Partial<Contract>) => {
    console.log('💾 Contrato atualizado:', data);
    // Lógica de atualização do contrato
    setEditingContract(null);
  };

  const handleCancelEdit = () => {
    console.log('🔙 Cancelando edição');
    setEditingContract(null);
  };

  if (editingContract) {
    return (
      <div className="p-6">
        <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h4">
              Editar Contrato: {editingContract.name}
            </Typography>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleCancelEdit}
            >
              Cancelar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Nome do contrato é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nome do Contrato"
                  variant="outlined"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="initialValue"
              control={control}
              rules={{ 
                required: 'Valor inicial é obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Valor Inicial"
                  variant="outlined"
                  error={!!errors.initialValue}
                  helperText={errors.initialValue?.message}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    {...field}
                    label="Status"
                    error={!!errors.status}
                  >
                    <MenuItem value="ativo">Ativo</MenuItem>
                    <MenuItem value="inativo">Inativo</MenuItem>
                    <MenuItem value="encerrado">Encerrado</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="dueDay"
              control={control}
              rules={{ 
                required: 'Dia de vencimento é obrigatório',
                min: { value: 1, message: 'Dia deve estar entre 1 e 31' },
                max: { value: 31, message: 'Dia deve estar entre 1 e 31' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Dia de Vencimento"
                  variant="outlined"
                  inputProps={{ min: 1, max: 31 }}
                  error={!!errors.dueDay}
                  helperText={errors.dueDay?.message}
                />
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleCancelEdit}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContractFilters
        onFilterChange={() => {}}
        metrics={{
          totalContracts: contracts.length,
          totalBilled: 0,
          totalPending: 0,
          averagePayment: 0,
        }}
        onNewContract={() => {}}
      />

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setViewMode('table')}
          className={`p-2 rounded-md ${
            viewMode === 'table' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LayoutList className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('cards')}
          className={`p-2 rounded-md ${
            viewMode === 'cards' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onEdit={() => handleEdit(contract)}
            />
          ))}
        </div>
      ) : (
        <ContractTable
          contracts={contracts}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}