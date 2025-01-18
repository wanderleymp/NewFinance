#!/bin/bash

# Diretório dos componentes
COMPONENTS_DIR="/Users/wanderleymacedopinheirojr/Dev/New/NewFinance/src/modules/contracts/components"

# Atualizar imports
for file in "$COMPONENTS_DIR"/*.tsx; do
    # Substituir imports de tipos
    sed -i '' 's|../types/contract|../types/contract|g' "$file"
    
    # Substituir imports de mockData
    sed -i '' 's|../lib/mockData|../services/mockData|g' "$file"
    
    # Substituir imports de componentes locais
    sed -i '' 's|from '\''./|from '\''../components/|g' "$file"
done

echo "Imports atualizados com sucesso!"
