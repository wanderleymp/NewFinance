#!/bin/bash

# Definir cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem cor

# Navegando para o diretório do módulo de contratos
cd "$(dirname "$0")"

# Limpar diretório de build
echo -e "${YELLOW}Limpando diretório de build...${NC}"
rm -rf dist

# Criar diretório de build
mkdir -p dist

# Compilar TypeScript
echo -e "${YELLOW}Compilando TypeScript...${NC}"
npx tsc -p tsconfig.json

# Copiar arquivos não-TypeScript
echo -e "${YELLOW}Copiando recursos adicionais...${NC}"
cp -R src/types dist/types
cp package.json dist/
cp README.md dist/

# Verificar status da compilação
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Build do módulo de Contratos concluída com sucesso!${NC}"
    
    # Mostrar tamanho do build
    BUILD_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}📦 Tamanho do build: ${BUILD_SIZE}${NC}"
else
    echo -e "${RED}❌ Falha na build do módulo de Contratos.${NC}"
fi

# Gerar relatório de build
echo "Build realizada em $(date)" > dist/build-report.txt

exit $BUILD_STATUS
