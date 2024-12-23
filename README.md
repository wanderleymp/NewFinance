# Agile Finance

Sistema de gerenciamento financeiro moderno e intuitivo.

## Versão 1.0.0.0

### Funcionalidades

- ✅ Sistema de autenticação
- ✅ Dashboard financeiro
- ✅ Gerenciamento de movimentações
  - Visualização em cards e tabela
  - Filtros por período, status e tipo
  - Paginação
- ✅ Interface moderna e responsiva
- ✅ Tema claro/escuro

### Tecnologias

- Frontend:
  - React
  - Material UI
  - Vite
  - React Router
  - Axios
  - Date-fns
  - Notistack

### Requisitos

- Node.js >= 14
- npm >= 6

### Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
```

2. Instale as dependências:
```bash
# Frontend
cd frontend
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Frontend
cp .env.example .env
```

4. Inicie o projeto:
```bash
# Frontend
npm run dev
```

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Visualiza a build de produção localmente

### Estrutura do Projeto

```
frontend/
  ├── public/
  ├── src/
  │   ├── components/
  │   ├── pages/
  │   ├── services/
  │   ├── theme/
  │   ├── App.jsx
  │   └── main.jsx
  ├── .env
  └── package.json
```

### Solução de Problemas e Boas Práticas

#### Problemas Comuns e Soluções

1. **Componentes Material-UI não definidos**
   - Sempre declare explicitamente todos os imports necessários
   - Evite depender de imports indiretos
   - Mantenha os imports organizados por categoria (UI components, icons, etc)

2. **Problemas com Cache e Hot Reload**
   - Se a página começar a se comportar de forma estranha:
     - Faça um hard refresh (Ctrl+F5)
     - Limpe o cache do navegador
     - Reinicie o servidor de desenvolvimento

3. **Inconsistências no Hot Module Replacement (HMR)**
   - O HMR do Vite pode causar estados inconsistentes
   - Se notar comportamentos estranhos após alterações:
     - Pare o servidor (Ctrl+C)
     - Delete a pasta node_modules/.vite
     - Reinicie o servidor (npm run dev)

#### Boas Práticas de Desenvolvimento

1. **Imports e Dependências**
   - Declare todos os imports explicitamente no início do arquivo
   - Agrupe imports por categoria (React, Material-UI, utils, etc)
   - Evite imports dinâmicos desnecessários
   - Mantenha as dependências atualizadas regularmente

2. **Componentes React**
   - Use componentes funcionais com hooks
   - Mantenha os componentes pequenos e focados
   - Extraia lógica complexa para hooks customizados
   - Documente props e comportamentos importantes

3. **Material-UI**
   - Use o sistema de tema para customizações
   - Prefira componentes nativos do Material-UI
   - Mantenha consistência no uso de variantes e props
   - Use o sx prop para estilos específicos de componente

4. **Performance**
   - Use React.memo() para componentes que recebem props estáveis
   - Evite re-renders desnecessários
   - Otimize imagens e assets
   - Implemente lazy loading quando apropriado

### Versionamento

Utilizamos [Semantic Versioning](https://semver.org/) para o versionamento.

- Formato: X.Y.Z.W
  - X: Major version (mudanças incompatíveis)
  - Y: Minor version (novas funcionalidades)
  - Z: Patch version (correções de bugs)
  - W: Build version (builds específicos)

### Roadmap

#### Segurança e DevOps
- [ ] **Aprimoramentos de Segurança GitHub**
  - [ ] Configurar proteção da branch main
  - [ ] Implementar revisão obrigatória de PRs
  - [ ] Configurar status checks obrigatórios
  - [ ] Adicionar CODEOWNERS
  - [ ] Configurar Dependabot
  - [ ] Implementar análise de segurança com CodeQL

- [ ] **CI/CD Enhancements**
  - [ ] Configurar deploy automático
  - [ ] Adicionar testes automatizados
  - [ ] Implementar staging environment
  - [ ] Configurar monitoramento de performance
  - [ ] Adicionar relatórios de cobertura de código

#### Funcionalidades Futuras

### Contribuição

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

### Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
