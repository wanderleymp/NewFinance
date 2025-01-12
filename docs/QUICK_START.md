# Quick Start - NewFinance

## Comandos Rápidos

### 1. Iniciar um Novo CRUD
```bash
# Entre na pasta frontend
cd frontend

# Crie uma nova feature (substitua categorias pelo nome do seu CRUD)
npm run feature crud-categorias
```

### 2. Finalizar um CRUD
```bash
# Quando terminar de desenvolver o CRUD
npm run finish
```

### 3. Criar Release
```bash
# Para novo CRUD completo
npm run release:minor

# Para correções
npm run release:patch

# Para builds
npm run release:build
```

## Exemplo Prático: CRUD de Categorias

1. **Iniciar desenvolvimento:**
```bash
cd frontend
npm run feature crud-categorias
```

2. **Desenvolver o CRUD**
   - Crie seus componentes
   - Faça seus commits
   - Teste tudo

3. **Finalizar desenvolvimento:**
```bash
npm run finish
```

4. **Após aprovação do PR, criar release:**
```bash
npm run release:minor
```

## Dicas

- Sempre faça `git pull` antes de começar
- Faça commits pequenos e frequentes
- Teste antes de finalizar
- Mantenha a documentação atualizada

## Comandos Git Úteis

```bash
# Ver status
git status

# Ver branch atual
git branch

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "feat(categorias): adiciona listagem"

# Ver histórico
git log
```
