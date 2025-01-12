# Guia GitHub - NewFinance

Este guia contém todas as informações necessárias para trabalhar com o repositório GitHub do NewFinance.

## Configurações de Segurança

### Secrets
1. Navegue até `Settings > Secrets and variables > Actions`
2. Adicione os seguintes secrets:
   - `VITE_API_URL`: URL da API de produção

### Proteção de Branch
1. Acesse `Settings > Branches`
2. Adicione regra de proteção para `main`:
   - ☐ "Require pull request reviews before merging"
   - ☐ "Require status checks to pass before merging"
   - ☐ "Include administrators"

## Fluxo de Trabalho

### Desenvolvimento de Features

1. Criar nova branch:
```bash
git checkout -b feature/nome-da-feature
```

2. Fazer alterações e commits:
```bash
git add .
git commit -m "descrição das alterações"
```

3. Push da nova branch:
```bash
git push origin feature/nome-da-feature
```

4. No GitHub:
   - Criar Pull Request
   - Aguardar review
   - Aguardar CI passar
   - Fazer merge na main

### Correção de Bugs

1. Criar branch de fix:
```bash
git checkout -b fix/nome-do-bug
```

2. Seguir mesmo processo de features

### Releases

#### Via Terminal
```bash
# Atualizar versão no package.json primeiro
# Criar tag
git tag -a v1.0.1.0 -m "Descrição da nova versão"
git push origin --tags
```

#### Via GitHub
1. Acessar `Releases`
2. Clicar em `Create a new release`
3. Escolher tag
4. Adicionar descrição
5. Publicar

## CI/CD

### Workflows Configurados

O arquivo `.github/workflows/ci.yml` define:
- Build e teste em push para main
- Build e teste em pull requests
- Build, teste e deploy em novas releases

### Ambientes
- Build: Node.js 18.x
- OS: Ubuntu Latest

### Jobs
1. **Build**:
   - Checkout do código
   - Setup Node.js
   - Instalação de dependências
   - Lint
   - Build
   - Upload do artefato

2. **Deploy** (em releases):
   - Download do artefato
   - Deploy (a ser configurado)

## Versionamento

Seguimos Semantic Versioning (X.Y.Z.W):
- X: Major version (mudanças incompatíveis)
- Y: Minor version (novas funcionalidades)
- Z: Patch version (correções de bugs)
- W: Build version

## Comandos Úteis

### Git
```bash
# Ver status
git status

# Ver branches
git branch -a

# Atualizar branch local
git pull origin main

# Ver tags
git tag -l

# Ver remotes
git remote -v
```

### NPM
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Preparar release
npm run prepare-release
```
