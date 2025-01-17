#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para incrementar versão
increment_version() {
    local version=$1
    local position=$2
    
    IFS='.' read -ra ADDR <<< "$version"
    ADDR[$position]=$((ADDR[$position] + 1))
    
    # Zerar versões menores
    for ((i=position+1; i<${#ADDR[@]}; i++)); do
        ADDR[$i]=0
    done
    
    echo "${ADDR[0]}.${ADDR[1]}.${ADDR[2]}.${ADDR[3]}"
}

# Função para preparar deploy
prepare_deploy() {
    echo -e "${YELLOW}Iniciando processo de deploy para produção${NC}"
    
    # Atualizar branch develop
    echo -e "${GREEN}Atualizando branch develop${NC}"
    git checkout develop
    git pull origin develop
    
    # Fazer merge de develop para main
    echo -e "${GREEN}Fazendo merge de develop para main${NC}"
    git checkout main
    git merge develop
    
    # Fazer push das mudanças
    git push origin main
    git push origin develop
    
    # Executar build
    echo -e "${GREEN}Executando npm run build${NC}"
    npm run build
    
    # Deploy para produção
    echo -e "${GREEN}Iniciando deploy para produção${NC}"
    npm run deploy

    # Se o deploy for bem-sucedido, incrementa a versão
    if [ $? -eq 0 ]; then
        # Incrementar versão
        local current_version=$(node -p "require('./package.json').version")
        local new_version=$(increment_version "$current_version" 3)
        
        # Atualizar package.json com nova versão
        npm version "$new_version" --no-git-tag-version
        
        # Commitar mudanças de versão
        git add package.json
        git commit -m "Bump version to $new_version"
        git push origin main

        echo -e "${GREEN}Versão incrementada para $new_version${NC}"
    else
        echo -e "${RED}Deploy falhou. Versão não incrementada.${NC}"
        exit 1
    fi
}

# Função para otimizar build
optimize_build() {
    echo -e "${YELLOW}Otimizando build...${NC}"
    
    # Adicionar configurações de otimização no vite.config.js
    cat > vite.config.js << EOL
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  }
})
EOL

    echo -e "${GREEN}Configurações de otimização aplicadas!${NC}"
}

# Menu principal
case "$1" in
    "deploy")
        optimize_build
        prepare_deploy
        ;;
    *)
        echo -e "${RED}Uso: $0 {deploy}${NC}"
        exit 1
        ;;
esac
