import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions 
} from '@mui/material';
import { ContractProvider, useContractContext } from '../contexts/ContractContext';
import ContractForm from './ContractForm';
import { Contract } from '../types/contract';

// Componente de lista de contratos usando o contexto
const ContractList: React.FC = () => {
  const { 
    contracts, 
    loading, 
    error, 
    page, 
    totalPages, 
    changePage, 
    deleteContract 
  } = useContractContext();

  const [selectedContract, setSelectedContract] = useState<Contract | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsFormOpen(true);
  };

  const handleDeleteContract = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      await deleteContract(id);
    }
  };

  if (loading) return <Typography>Carregando contratos...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4">Gerenciamento de Contratos</Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => {
          setSelectedContract(undefined);
          setIsFormOpen(true);
        }}
      >
        Novo Contrato
      </Button>

      {contracts.map(contract => (
        <Box key={contract.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ flexGrow: 1 }}>
            {contract.name} - R$ {contract.value}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => handleEditContract(contract)}
            sx={{ mr: 1 }}
          >
            Editar
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => handleDeleteContract(contract.id)}
          >
            Excluir
          </Button>
        </Box>
      ))}

      {/* Paginação */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button 
          disabled={page === 1} 
          onClick={() => changePage(page - 1)}
        >
          Anterior
        </Button>
        <Typography sx={{ mx: 2 }}>
          Página {page} de {totalPages}
        </Typography>
        <Button 
          disabled={page === totalPages} 
          onClick={() => changePage(page + 1)}
        >
          Próxima
        </Button>
      </Box>

      {/* Diálogo de Formulário */}
      <Dialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedContract ? 'Editar Contrato' : 'Novo Contrato'}
        </DialogTitle>
        <DialogContent>
          <ContractForm 
            contract={selectedContract}
            onSubmit={async (data) => {
              try {
                if (selectedContract) {
                  // Atualização
                  await updateContract(selectedContract.id, data);
                } else {
                  // Criação
                  await createContract(data);
                }
                setIsFormOpen(false);
              } catch (error) {
                // Erro será tratado pelo contexto
              }
            }}
            onCancel={() => setIsFormOpen(false)}
            isEditing={!!selectedContract}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Wrapper com o Provider
const ContractManager: React.FC = () => {
  return (
    <ContractProvider>
      <ContractList />
    </ContractProvider>
  );
};

export default ContractManager;
