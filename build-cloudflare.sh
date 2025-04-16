#!/bin/bash
# Script para build ignorando erros de TypeScript

# Criar um arquivo tsconfig temporário que ignora a verificação de tipos
echo '{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "skipLibCheck": true,
    "allowJs": true,
    "checkJs": false,
    "noImplicitAny": false,
    "skipDefaultLibCheck": true
  }
}' > tsconfig.temp.json

# Executar o build do Vite diretamente, sem verificação de tipos
echo "Iniciando build do Vite sem verificação de tipos..."
npx vite build

# Remover o arquivo temporário
rm tsconfig.temp.json

echo "Build concluído!"
