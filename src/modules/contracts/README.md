# Módulo de Contratos

## Visão Geral
Este módulo gerencia todas as funcionalidades relacionadas a contratos no sistema.

## Estrutura
- `components/`: Componentes de interface para contratos
- `hooks/`: Hooks personalizados para gerenciamento de estado
- `pages/`: Páginas completas de contratos
- `services/`: Serviços de comunicação com API
- `types/`: Definições de tipos para contratos
- `utils/`: Funções utilitárias específicas de contratos

## Principais Funcionalidades
- Listagem de contratos
- Criação de novos contratos
- Edição de contratos
- Detalhes de contratos
- Gerenciamento de serviços extras
- Histórico de modificações

## Hooks Disponíveis
- `useContracts`: Gerencia lista de contratos
- `useContractDetails`: Recupera detalhes de um contrato específico

## Componentes Principais
- `ContractList`: Lista de contratos
- `ContractCard`: Cartão resumido de contrato
- `NewContractModal`: Modal para criar novo contrato
- `EditContractModal`: Modal para editar contrato existente

## Dependências
- React
- Material UI
- Axios
- Date-fns

## Próximos Passos
- Implementar testes unitários
- Adicionar validações mais robustas
- Melhorar tratamento de erros
