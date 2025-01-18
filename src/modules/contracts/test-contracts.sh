#!/bin/bash

# Definir cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # Sem cor

# Navegando para o diretório do módulo de contratos
cd "$(dirname "$0")"

# Executar testes com cobertura
echo -e "${GREEN}Executando testes do módulo de Contratos...${NC}"

npx jest --config jest.config.js --coverage

# Verificar o status dos testes
TEST_STATUS=$?

if [ $TEST_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os testes passaram com sucesso!${NC}"
else
    echo -e "${RED}❌ Alguns testes falharam. Verifique o relatório acima.${NC}"
fi

# Abrir relatório de cobertura no navegador
open coverage/lcov-report/index.html

exit $TEST_STATUS
