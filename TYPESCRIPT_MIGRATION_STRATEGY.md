# Estratégia de Migração e Padronização de Projeto

## Seções
- [Migração TypeScript](#migração-typescript)
- [Padronização de Design](#padronização-de-design)
- [Estrutura de Pastas](#estrutura-de-pastas)

## Migração TypeScript

### Objetivo
Migrar gradualmente o projeto de JavaScript para TypeScript, mantendo a estabilidade e funcionalidade do sistema.

## Fases de Migração

### Fase 1: Preparação
- [x] Adicionar TypeScript como dependência
- [x] Configurar compilador TypeScript
- [x] Manter código JavaScript existente funcionando
- [x] Criar novos componentes e features em TypeScript

### Fase 2: Coexistência
- Configurar build para aceitar .js e .tsx
- Usar `allowJs` no TypeScript
- Migrar componentes novos/modificados para TypeScript
- Manter componentes antigos em JavaScript

### Fase 3: Migração Progressiva
- Converter componentes antigos sob demanda
- Priorizar componentes mais críticos/modificados
- Manter retrocompatibilidade

## Configurações Técnicas

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

### Dependências a Instalar
```bash
npm install -D typescript @types/react @types/react-dom
```

### Scripts de Build (package.json)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

## Padronização de Design

### Objetivos
- Manter consistência com Material UI
- Incorporar boas práticas de design
- Criar componentes reutilizáveis
- Design system robusto

### Estratégia de Implementação
- Fase 1: Novos componentes seguem novo padrão
- Fase 2: Refatorar componentes existentes
- Priorizar consistência visual
- Manter experiência do usuário

### Diretrizes de Design
- Usar paleta de cores definida
- Componentes com estados claros
- Responsividade
- Acessibilidade
- Animações sutis

## Estrutura de Pastas

### Novo Padrão de Organização
```
src/
├── components/
│   ├── common/           # Componentes genéricos
│   ├── contracts/        # Componentes de contratos
│   └── dashboard/        # Componentes de dashboard
├── pages/                # Páginas completas
├── services/             # Camada de serviços
├── types/                # Definições de tipos
├── utils/                # Funções utilitárias
└── styles/               # Estilos globais
```

### Estratégia de Migração
- Fase 1: Criar nova estrutura
- Fase 2: Migrar componentes existentes
- Manter retrocompatibilidade
- Documentar mudanças

### Boas Práticas
- Imports absolutos
- Nomenclatura consistente
- Separação de responsabilidades
- Modularidade

## Boas Práticas
- Converter arquivos para .tsx gradualmente
- Manter compatibilidade com versões anteriores
- Realizar testes após cada migração
- Documentar mudanças significativas

## Pontos de Atenção
- Verificar compatibilidade de bibliotecas
- Atualizar importações
- Adicionar tipagens progressivamente

## Log de Migração

### Componentes Migrados
- [ ] App.tsx
- [ ] Dashboard.tsx
- [ ] SystemService.ts

### Pendências
- Configurar ESLint para TypeScript
- Atualizar configurações de build
- Migrar dependências

### Design System
- [ ] Definir paleta de cores
- [ ] Criar componentes base
- [ ] Documentar guidelines

### Estrutura
- [ ] Criar nova estrutura de pastas
- [ ] Migrar componentes
- [ ] Atualizar imports

## Observações
- Migração incremental
- Manter funcionalidade
- Comunicar mudanças à equipe

## Contato
Em caso de dúvidas, consultar documentação ou equipe de desenvolvimento.
