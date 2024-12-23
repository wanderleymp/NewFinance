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

### Versionamento

Utilizamos [Semantic Versioning](https://semver.org/) para o versionamento.

- Formato: X.Y.Z.W
  - X: Major version (mudanças incompatíveis)
  - Y: Minor version (novas funcionalidades)
  - Z: Patch version (correções de bugs)
  - W: Build version (builds específicos)

### Contribuição

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

### Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
