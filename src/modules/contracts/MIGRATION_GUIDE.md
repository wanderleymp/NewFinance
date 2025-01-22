# Guia de Migração para Novo Serviço de Contratos

## Visão Geral

Este guia fornece instruções para migrar do serviço de contratos existente para a nova implementação.

## Mudanças Principais

### 1. Serviço de API
- Antigo: `contractService.ts`
- Novo: `newContractService.ts`

### 2. Hook de Gerenciamento
- Antigo: `useContracts.ts`
- Novo: `useNewContracts.ts`

## Passos de Migração

### Atualização de Importações
```typescript
// Antes
import { contractService } from './services/contractService';

// Depois
import { NewContractService } from './services/newContractService';
```

### Obtendo Instância do Serviço
```typescript
// Antes
const contractService = contractService;

// Depois
const contractService = NewContractService.getInstance();
```

### Métodos de CRUD

#### Listagem
```typescript
// Antes
const contracts = await contractService.getContracts();

// Depois
const { contracts } = useNewContracts();
```

#### Criação
```typescript
// Antes
const newContract = await contractService.createContract(data);

// Depois
const { createContract } = useNewContracts();
const newContract = await createContract(data);
```

#### Atualização
```typescript
// Antes
const updatedContract = await contractService.updateContract(id, data);

// Depois
const { updateContract } = useNewContracts();
const updatedContract = await updateContract(id, data);
```

#### Exclusão
```typescript
// Antes
await contractService.deleteContract(id);

// Depois
const { deleteContract } = useNewContracts();
await deleteContract(id);
```

## Novos Recursos

### Validação Automática
- Validação de dados antes de operações CRUD
- Tratamento de erros mais detalhado

### Logging
- Registro automático de ações
- Facilita depuração e auditoria

### Gerenciamento de Estado
- Hook com estado gerenciado
- Métodos para manipulação de contratos

## Considerações

- A nova implementação mantém compatibilidade com a API existente
- Recomenda-se migração gradual
- Testes devem ser realizados cuidadosamente

## Exemplo Completo de Migração

```typescript
// Componente antigo
function OldContractList() {
  const [contracts, setContracts] = useState([]);
  
  useEffect(() => {
    async function fetchContracts() {
      const data = await contractService.getContracts();
      setContracts(data);
    }
    fetchContracts();
  }, []);
}

// Componente novo
function NewContractList() {
  const { 
    contracts, 
    loading, 
    error, 
    createContract, 
    updateContract 
  } = useNewContracts();

  // Lógica simplificada
}
```

## Suporte

Em caso de dúvidas ou problemas durante a migração, entre em contato com a equipe de desenvolvimento.
