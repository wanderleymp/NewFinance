# Documentação Técnica - Módulo de Contratos

## 1. Arquitetura

### Estrutura de Diretórios
```
src/modules/contracts/
├── components/      # Componentes React
├── hooks/           # Hooks personalizados
├── pages/           # Páginas completas
├── services/        # Comunicação com API
├── types/           # Definições de tipos
└── utils/           # Funções utilitárias
```

## 2. Padrões de Desenvolvimento

### Hooks
- Todos os hooks seguem o padrão `use[NomeFuncionalidade]`
- Retornam objeto com estado, loading e funções de manipulação

### Componentes
- Componentes seguem padrão funcional com TypeScript
- Utilizam hooks personalizados para gerenciamento de estado
- Seguem princípios de componentização do React

### Tipos
- Definidos em `types/contract.ts`
- Utilizam interfaces TypeScript
- Seguem nomenclatura camelCase

## 3. Guia de Contribuição

### Regras Gerais
- Sempre usar TypeScript
- Manter cobertura de testes acima de 80%
- Seguir regras de lint definidas
- Documentar novas funcionalidades

### Processo de Desenvolvimento
1. Criar branch a partir de `develop`
2. Implementar funcionalidade
3. Escrever testes
4. Rodar `npm run test`
5. Criar Pull Request

## 4. Dependências Principais
- React 18
- Material UI
- Axios
- Date-fns

## 5. Scripts Disponíveis
- `npm test`: Executa testes
- `npm run lint`: Verifica código
- `npm run build`: Compila TypeScript

## 6. Boas Práticas
- Manter componentes pequenos e focados
- Usar hooks para lógica de estado
- Evitar prop drilling
- Utilizar lazy loading quando possível
