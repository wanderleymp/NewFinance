# Guia de Desenvolvimento - NewFinance

## Fluxo de Desenvolvimento CRUD a CRUD

### 1. Iniciando um Novo CRUD

Para cada novo CRUD, siga estas etapas:

```bash
# 1. Criar feature branch para o CRUD
./scripts/release.sh feature crud-[nome]

# Exemplo para CRUD de categorias:
./scripts/release.sh feature crud-categorias
```

### 2. Desenvolvimento do CRUD

Desenvolva o CRUD em etapas:

1. **Backend (se necessário)**
   - Models
   - Controllers
   - Routes
   - Tests

2. **Frontend**
   - Components
   - Services
   - Pages
   - Tests

3. **Commits por Funcionalidade**
   ```bash
   git add .
   git commit -m "feat(categorias): adiciona listagem de categorias"
   git commit -m "feat(categorias): adiciona criação de categoria"
   git commit -m "feat(categorias): adiciona edição de categoria"
   git commit -m "feat(categorias): adiciona remoção de categoria"
   ```

### 3. Finalizando o CRUD

Quando o CRUD estiver completo:

```bash
# Finalizar a feature
./scripts/release.sh finish
```

### 4. Criando Release

Após o merge do PR, criar uma nova release:

```bash
# Para nova funcionalidade (CRUD completo)
./scripts/release.sh release minor

# Para correções
./scripts/release.sh release patch

# Para builds
./scripts/release.sh release build
```

## Padrões de Commit

Use prefixos para identificar o tipo de alteração:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de build, etc

Exemplo:
```bash
git commit -m "feat(categorias): adiciona CRUD completo"
git commit -m "fix(categorias): corrige validação de formulário"
```

## Ordem Sugerida de Desenvolvimento

1. **CRUD de Configurações Básicas**
   - Categorias
   - Tags
   - Contas

2. **CRUD de Movimentações**
   - Receitas
   - Despesas
   - Transferências

3. **CRUD de Planejamento**
   - Orçamentos
   - Metas
   - Lembretes

4. **Relatórios e Dashboards**
   - Relatórios por período
   - Gráficos
   - Análises

## Versionamento

- **Major (1.x.x.x)**: Mudanças incompatíveis
- **Minor (x.1.x.x)**: Novo CRUD ou funcionalidade
- **Patch (x.x.1.x)**: Correções de bugs
- **Build (x.x.x.1)**: Builds específicos

## Checklist por CRUD

- [ ] **Frontend**
  - [ ] Componentes
    - [ ] Formulário
    - [ ] Lista/Tabela
    - [ ] Filtros
  - [ ] Serviços
    - [ ] API Integration
    - [ ] Data Transformation
  - [ ] Páginas
    - [ ] Lista
    - [ ] Criar/Editar
    - [ ] Detalhes
  - [ ] Testes
    - [ ] Unit Tests
    - [ ] Integration Tests

- [ ] **Documentação**
  - [ ] README atualizado
  - [ ] Comentários no código
  - [ ] Documentação da API

## Dicas

1. **Uma coisa por vez**
   - Foque em um CRUD por vez
   - Complete todas as funcionalidades antes de passar para o próximo

2. **Testes**
   - Escreva testes para cada funcionalidade
   - Teste manualmente antes de finalizar

3. **Code Review**
   - Revise seu próprio código antes do PR
   - Peça review de outros desenvolvedores

4. **Documentação**
   - Mantenha a documentação atualizada
   - Documente decisões importantes
