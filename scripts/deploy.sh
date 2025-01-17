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
    echo -e "${YELLOW}Iniciando processo de deploy para repositório${NC}"
    
    # Verificar se está na branch develop
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" != "develop" ]; then
        echo -e "${RED}Erro: Você deve estar na branch develop${NC}"
        exit 1
    fi
    
    # Atualizar branch develop
    echo -e "${GREEN}Atualizando branch develop${NC}"
    git pull origin develop
    
    # Fazer merge de develop para main
    echo -e "${GREEN}Fazendo merge de develop para main${NC}"
    git checkout main
    git merge develop
    
    # Incrementar versão
    local current_version=$(node -p "require('./package.json').version")
    local new_version=$(increment_version "$current_version" 3)
    
    # Atualizar package.json com nova versão
    npm version "$new_version" --no-git-tag-version
    
    # Commitar mudanças de versão
    git add package.json
    git commit -m "Bump version to $new_version"
    
    # Push para repositório
    git push origin main
    
    # Voltar para develop
    git checkout develop
    
    # Criar nova branch com nome da versão completa
    new_branch_name="feature/$new_version"
    git checkout -b "$new_branch_name"
    
    # Merge main para nova branch para trazer a versão atualizada
    git merge main
    
    # Push da nova branch
    git push -u origin "$new_branch_name"
    
    echo -e "${GREEN}Deploy concluído. Nova versão: $new_version${NC}"
    echo -e "${GREEN}Nova branch criada: $new_branch_name${NC}"
}

# Menu principal
case "$1" in
    "deploy")
        prepare_deploy
        ;;
    *)
        echo -e "${RED}Uso: $0 {deploy}${NC}"
        exit 1
        ;;
esac
