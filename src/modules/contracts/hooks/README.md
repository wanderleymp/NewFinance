# Hook de Contratos (useNewContracts)

## Visão Geral

O hook `useNewContracts` fornece uma interface completa para gerenciamento de contratos, oferecendo funcionalidades de listagem, criação, atualização e exclusão.

## Instalação

```typescript
import { useNewContracts } from './useNewContracts';
```

## Uso Básico

### Listagem de Contratos
```typescript
function ContractListComponent() {
  const { 
    contracts, 
    loading, 
    error, 
    page, 
    totalPages, 
    changePage 
  } = useNewContracts();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      {contracts.map(contract => (
        <ContractCard key={contract.id} contract={contract} />
      ))}
      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={changePage} 
      />
    </>
  );
}
```

### Criação de Contrato
```typescript
function CreateContractForm() {
  const { createContract, error } = useNewContracts();

  const handleSubmit = async (formData) => {
    try {
      const newContract = await createContract({
        name: formData.name,
        value: formData.value,
        status: 'ativo'
      });
      // Contrato criado com sucesso
    } catch (validationError) {
      // Tratar erros de validação
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
      {/* Campos do formulário */}
    </form>
  );
}
```

### Atualização de Contrato
```typescript
function EditContractComponent({ contractId }) {
  const { updateContract, error } = useNewContracts();

  const handleUpdate = async (updatedData) => {
    try {
      const updatedContract = await updateContract(
        contractId, 
        updatedData
      );
      // Contrato atualizado com sucesso
    } catch (validationError) {
      // Tratar erros de validação
    }
  };

  return (
    <div>
      {error && <ErrorMessage message={error} />}
      {/* Formulário de edição */}
    </div>
  );
}
```

## Parâmetros

### `useNewContracts(initialPage = 1, limit = 10)`

- `initialPage`: Página inicial para busca (padrão: 1)
- `limit`: Número de itens por página (padrão: 10)

## Retorno

O hook retorna um objeto com as seguintes propriedades:

- `contracts`: Lista de contratos
- `loading`: Estado de carregamento
- `error`: Mensagem de erro
- `page`: Página atual
- `totalPages`: Total de páginas
- `createContract()`: Método para criar contrato
- `updateContract()`: Método para atualizar contrato
- `deleteContract()`: Método para excluir contrato
- `changePage()`: Método para mudar página
- `refetch()`: Método para recarregar contratos
- `clearError()`: Método para limpar mensagem de erro

## Validações

As operações de criação e atualização passam por validações rigorosas:
- Nome do contrato deve ter pelo menos 3 caracteres
- Valor do contrato deve ser positivo
- Status deve ser um dos valores válidos

## Tratamento de Erros

Erros de validação e de requisição são capturados e disponibilizados através da propriedade `error`.

## Logging

Todas as ações são registradas para facilitar depuração e auditoria.
