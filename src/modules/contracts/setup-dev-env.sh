#!/bin/bash

# Definir cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem cor

# Função para verificar comandos
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar pré-requisitos
echo -e "${YELLOW}Verificando pré-requisitos...${NC}"

# Verificar Node.js
if ! command_exists node; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale o Node.js 18+.${NC}"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v)
if [[ ! "$NODE_VERSION" =~ ^v18\. ]]; then
    echo -e "${RED}❌ Versão do Node.js incompatível. Necessário Node.js 18+.${NC}"
    exit 1
fi

# Verificar npm
if ! command_exists npm; then
    echo -e "${RED}❌ npm não encontrado. Por favor, instale o npm.${NC}"
    exit 1
fi

# Navegar para o diretório do módulo
cd "$(dirname "$0")"

# Limpar cache do npm
echo -e "${YELLOW}Limpando cache do npm...${NC}"
npm cache clean --force

# Instalar dependências
echo -e "${YELLOW}Instalando dependências...${NC}"
npm ci

# Configurar ambiente de desenvolvimento
echo -e "${YELLOW}Configurando ambiente de desenvolvimento...${NC}"

# Criar arquivo de ambiente de desenvolvimento
cat > .env.development << EOL
# Configurações de ambiente para desenvolvimento do módulo de contratos
VITE_API_URL=http://localhost:3000/api/contracts
NODE_ENV=development
DEBUG=contracts:*
EOL

# Configurar hooks do Git
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << EOL
#!/bin/sh
npm run lint
npm test
EOL
chmod +x .git/hooks/pre-commit

# Gerar tipos
echo -e "${YELLOW}Gerando tipos...${NC}"
npm run build:types

# Finalizar
echo -e "${GREEN}✅ Ambiente de desenvolvimento configurado com sucesso!${NC}"
echo -e "${GREEN}Próximos passos:${NC}"
echo -e "- npm run dev (iniciar desenvolvimento)"
echo -e "- npm test (executar testes)"
echo -e "- npm run lint (verificar código)"
