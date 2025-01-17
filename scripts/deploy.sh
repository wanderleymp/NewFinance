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
    
    echo "${ADDR[0]}.${ADDR[1]}.${ADDR[2]}"
}

# Função para preparar deploy
prepare_deploy() {
    echo -e "${YELLOW}Iniciando processo de deploy para repositório${NC}"
    
    # Obter nome da branch atual
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    # Push da branch atual para remoto
    echo -e "${GREEN}Fazendo push da branch atual: $current_branch${NC}"
    git push -u origin "$current_branch"
    
    # Verificar se o push foi bem-sucedido
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao fazer push da branch${NC}"
        exit 1
    fi
    
    # Voltar para develop
    echo -e "${GREEN}Atualizando branch develop${NC}"
    git checkout develop
    git pull origin develop
    
    # Fazer merge da branch atual para develop
    echo -e "${GREEN}Fazendo merge da $current_branch para develop${NC}"
    git merge "$current_branch"
    
    # Verificar se o merge foi bem-sucedido
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao fazer merge para develop${NC}"
        exit 1
    fi
    
    git push origin develop
    
    # Verificar se o push foi bem-sucedido
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao fazer push para develop${NC}"
        exit 1
    fi
    
    # Fazer merge de develop para main
    echo -e "${GREEN}Fazendo merge de develop para main${NC}"
    git checkout main
    git pull origin main
    git merge develop
    
    # Verificar se o merge foi bem-sucedido
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao fazer merge para main${NC}"
        exit 1
    fi
    
    git push origin main
    
    # Verificar se o push foi bem-sucedido
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao fazer push para main${NC}"
        exit 1
    fi
    
    # Se tudo funcionar, incrementar versão
    local current_version=$(node -p "require('./package.json').version")
    local new_version=$(increment_version "$current_version" 2)
    
    # Atualizar package.json com nova versão
    npm version "$new_version"
    
    # Verificar se a atualização foi bem-sucedida
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao atualizar package.json${NC}"
        exit 1
    fi
    
    # Criar nova branch com nome da versão completa
    new_branch_name="feature/$new_version"
    git checkout -b "$new_branch_name"
    
    # Verificar se a criação da branch foi bem-sucedida
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao criar branch $new_branch_name${NC}"
        exit 1
    fi
    
    # Merge main para nova branch para trazer a versão atualizada
    git merge main
    
    # Verificar se o merge foi bem-sucedido
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao fazer merge para $new_branch_name${NC}"
        exit 1
    fi
    
    # Push da nova branch
    git push -u origin "$new_branch_name"
    
    # Verificar se o push foi bem-sucedido
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao fazer push para $new_branch_name${NC}"
        exit 1
    fi
    
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
