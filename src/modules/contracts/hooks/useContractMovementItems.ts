import { useState, useCallback, useEffect } from 'react';
import { Contract } from '../types/contract';
import { contractService } from '../services/contractService';

export interface MovementItem {
  id: number;
  name: string;
  description: string;
  value: number;
  type: 'service' | 'product' | 'other';
  contractId: string;
  movement_item_id: number;
  total_value: number;
}

interface UseMovementItemsReturn {
  movementItems: MovementItem[];
  loading: boolean;
  error: string | null;
  fetchMovementItems: (contractId: string) => Promise<void>;
}

export function useContractMovementItems(): UseMovementItemsReturn {
  const [movementItems, setMovementItems] = useState<MovementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovementItems = useCallback(async (contractId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await contractService.searchMovementItems({
        query: '',
        type: 'service'
      });
      
      // Verificar se a resposta tem dados
      if (!response?.data) {
        setMovementItems([]);
        return;
      }

      const items: MovementItem[] = response.data.map((item: any) => ({
        id: item.item_id,
        name: item.item_name,
        description: item.description || '',
        value: parseFloat(item.unit_price || 0),
        type: 'service',
        contractId: contractId,
        movement_item_id: item.movement_item_id,
        total_value: item.total_price
      }));

      setMovementItems(items);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar itens de movimento';
      console.error('Erro detalhado:', err);
      setError(errorMessage);
      setMovementItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    movementItems,
    loading,
    error,
    fetchMovementItems
  };
}
