import { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { ServiceOrderList } from './ServiceOrderList';
import { ServiceOrderGrid } from './ServiceOrderGrid';
import { ArrowLeft, Kanban, List, Grid } from 'lucide-react';

interface ServiceOrdersPageProps {
  onNavigateBack: () => void;
}

type ViewMode = 'kanban' | 'list' | 'grid';

export function ServiceOrdersPage({ onNavigateBack }: ServiceOrdersPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onNavigateBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Ordens de Serviço</h1>
        </div>

        <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded ${
              viewMode === 'kanban' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Kanban className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'kanban' && <KanbanBoard />}
      {viewMode === 'list' && <ServiceOrderList />}
      {viewMode === 'grid' && <ServiceOrderGrid />}
    </div>
  );
}