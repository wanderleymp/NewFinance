import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField 
} from '@mui/material';
import { useNewContracts } from '../hooks/useNewContracts';
import { Contract } from '../types/contract';

export function NewContractList() {
  const { 
    contracts, 
    loading, 
    error, 
    page, 
    totalPages, 
    createContract, 
    updateContract, 
    deleteContract, 
    changePage 
  } = useNewContracts();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractForm, setContractForm] = useState<Partial<Contract>>({});

  const handleCreateContract = async () => {
    try {
      await createContract(contractForm);
      setOpenCreateModal(false);
      setContractForm({});
    } catch (err) {
      console.error('Erro ao criar contrato', err);
    }
  };

  const handleUpdateContract = async () => {
    if (selectedContract) {
      try {
        await updateContract(selectedContract.id, contractForm);
        setSelectedContract(null);
        setContractForm({});
      } catch (err) {
        console.error('Erro ao atualizar contrato', err);
      }
    }
  };

  const handleDeleteContract = async (id: string) => {
    try {
      await deleteContract(id);
    } catch (err) {
      console.error('Erro ao deletar contrato', err);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setOpenCreateModal(true)}
      >
        Novo Contrato
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.id}</TableCell>
                <TableCell>{contract.name}</TableCell>
                <TableCell>{contract.value}</TableCell>
                <TableCell>
                  <Button 
                    color="primary" 
                    onClick={() => {
                      setSelectedContract(contract);
                      setContractForm(contract);
                    }}
                  >
                    Editar
                  </Button>
                  <Button 
                    color="secondary" 
                    onClick={() => handleDeleteContract(contract.id)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div>
        <Button 
          disabled={page === 1} 
          onClick={() => changePage(page - 1)}
        >
          Anterior
        </Button>
        <span>Página {page} de {totalPages}</span>
        <Button 
          disabled={page === totalPages} 
          onClick={() => changePage(page + 1)}
        >
          Próximo
        </Button>
      </div>

      {/* Modal de Criação/Edição */}
      <Dialog 
        open={openCreateModal || !!selectedContract} 
        onClose={() => {
          setOpenCreateModal(false);
          setSelectedContract(null);
          setContractForm({});
        }}
      >
        <DialogTitle>
          {selectedContract ? 'Editar Contrato' : 'Novo Contrato'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            value={contractForm.name || ''}
            onChange={(e) => setContractForm(prev => ({...prev, name: e.target.value}))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Valor"
            type="number"
            value={contractForm.value || ''}
            onChange={(e) => setContractForm(prev => ({...prev, value: Number(e.target.value)}))}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenCreateModal(false);
            setSelectedContract(null);
            setContractForm({});
          }}>
            Cancelar
          </Button>
          <Button 
            color="primary" 
            onClick={selectedContract ? handleUpdateContract : handleCreateContract}
          >
            {selectedContract ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
