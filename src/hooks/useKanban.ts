import { useMemo } from 'react';

interface KanbanColumn<T> {
  id: string | number;
  title: string;
  items: T[];
}

export function useKanban<T extends { movement_status_id: number | null }>(
  items: T[],
  statuses: { id: number; name: string }[]
): KanbanColumn<T>[] {
  return useMemo(() => {
    const columns = statuses.map(status => ({
      id: status.id,
      title: status.name,
      items: items.filter(item => item.movement_status_id === status.id)
    }));

    // Add a column for items without status
    columns.unshift({
      id: 'no-status',
      title: 'Sem Status',
      items: items.filter(item => item.movement_status_id === null)
    });

    return columns;
  }, [items, statuses]);
}