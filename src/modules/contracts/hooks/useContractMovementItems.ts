import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Contract } from '../types/contract';

export interface MovementItem {
  id: string;
  name: string;
  description: string;
  value: number;
  type: 'service' | 'product' | 'other';
  contractId: string;
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
      // Substituir pela chamada real da API
      const response = await axios.get(`/api/contracts/${contractId}/movement-items`);
      
      const items: MovementItem[] = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        value: parseFloat(item.value),
        type: item.type || 'service',
        contractId: contractId
      }));

      setMovementItems(items);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar itens de movimento';
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
