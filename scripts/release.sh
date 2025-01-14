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

# Função para criar feature
create_feature() {
    local feature_name=$1
    echo -e "${YELLOW}Criando feature branch para: $feature_name${NC}"
    
    # Atualizar main
    git checkout main
    git pull origin main
    
    # Criar e mudar para nova branch
    git checkout -b "feature/$feature_name"
    
    echo -e "${GREEN}Branch feature/$feature_name criada com sucesso!${NC}"
    echo -e "Você pode começar a desenvolver sua feature agora."
}

# Função para finalizar feature
finish_feature() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    if [[ $current_branch != feature/* ]]; then
        echo -e "${RED}Erro: Você não está em uma feature branch${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Finalizando feature: $current_branch${NC}"
    
    # Commit alterações pendentes se houver
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}Existem alterações pendentes. Fazendo commit...${NC}"
        git add .
        read -p "Mensagem do commit: " commit_message
        git commit -m "$commit_message"
    fi
    
    # Push para o remote
    git push origin $current_branch
    
    echo -e "${GREEN}Feature finalizada e enviada para o GitHub${NC}"
    echo -e "Agora você pode criar um Pull Request em: https://github.com/wanderleymp/NewFinance/compare/main...$current_branch"
}

# Função para criar release
create_release() {
    local release_type=$1
    local current_version=$(node -p "require('./frontend/package.json').version")
    local new_version
    
    case $release_type in
        "major") new_version=$(increment_version "$current_version" 0);;
        "minor") new_version=$(increment_version "$current_version" 1);;
        "patch") new_version=$(increment_version "$current_version" 2);;
        "build") new_version=$(increment_version "$current_version" 3);;
        *) 
            echo -e "${RED}Tipo de release inválido. Use: major, minor, patch ou build${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${YELLOW}Criando release $new_version${NC}"
    
    # Atualizar versão no package.json
    cd frontend
    npm version $new_version --no-git-tag-version
    cd ..
    
    # Commit e tag
    git add .
    git commit -m "Release v$new_version"
    git tag -a "v$new_version" -m "Release version $new_version"
    
    # Push
    git push origin main
    git push origin "v$new_version"
    
    echo -e "${GREEN}Release v$new_version criada e enviada com sucesso!${NC}"
}

# Função para preparar novo build
prepare_build() {
    echo -e "${YELLOW}Iniciando processo de preparação de build${NC}"
    
    # 1. Atualizar branch develop do repositório remoto
    echo -e "${GREEN}Atualizando branch develop${NC}"
    git checkout develop
    git pull origin develop
    
    # 2. Merge do develop para main
    echo -e "${GREEN}Fazendo merge de develop para main${NC}"
    git checkout main
    git merge develop
    git push origin main
    
    # 3. Criar nova branch de build
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local build_branch="build/release-${timestamp}"
    git checkout -b "${build_branch}"
    
    # 4. Executar build
    echo -e "${GREEN}Executando npm run build${NC}"
    npm run build
    
    # 5. Incrementar versão
    local current_version=$(cat VERSION || echo "0.1.0")
    local new_version=$(increment_version "$current_version" 1)
    echo "$new_version" > VERSION
    
    # 6. Preparar commit e push
    git add dist VERSION  # Usando dist para projetos Vite
    git commit -m "Prepare new build: ${build_branch} (v${new_version})"
    git push -u origin "${build_branch}"
    
    echo -e "${GREEN}Build concluído com sucesso!${NC}"
    echo -e "${YELLOW}Próximos passos:${NC}"
    echo -e "1. Crie um Pull Request de ${build_branch} para main"
    echo -e "2. Faça o merge após revisão"
}

# Menu principal
case "$1" in
    "feature")
        if [ -z "$2" ]; then
            echo -e "${RED}Erro: Nome da feature é obrigatório${NC}"
            echo "Uso: ./release.sh feature nome-da-feature"
            exit 1
        fi
        create_feature "$2"
        ;;
    
    "finish")
        finish_feature
        ;;
    
    "release")
        if [ -z "$2" ]; then
            echo -e "${RED}Erro: Tipo de release é obrigatório${NC}"
            echo "Uso: ./release.sh release [major|minor|patch|build]"
            exit 1
        fi
        create_release "$2"
        ;;
    
    "build")
        prepare_build
        ;;
    
    *)
        echo -e "${YELLOW}Uso do script:${NC}"
        echo "  ./release.sh feature nome-da-feature  # Criar nova feature"
        echo "  ./release.sh finish                   # Finalizar feature atual"
        echo "  ./release.sh release [tipo]           # Criar release"
        echo "  ./release.sh build                    # Preparar novo build"
        echo ""
        echo -e "${YELLOW}Tipos de release:${NC}"
        echo "  major  # Mudanças incompatíveis (1.x.x.x)"
        echo "  minor  # Novas funcionalidades (x.1.x.x)"
        echo "  patch  # Correções de bugs (x.x.1.x)"
        echo "  build  # Builds específicos (x.x.x.1)"
        ;;
esac
