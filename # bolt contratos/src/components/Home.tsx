import { FileText, Wrench, BarChart3, MessageCircle } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: 'home' | 'service-orders' | 'chat') => void;
}

export function Home({ onNavigate }: HomeProps) {
  const modules = [
    {
      title: 'Contratos',
      icon: FileText,
      description: 'Gerenciamento de contratos recorrentes',
      color: 'bg-blue-500',
      action: () => console.log('Contratos'),
    },
    {
      title: 'Ordens de Serviço',
      icon: Wrench,
      description: 'Gestão de chamados e atendimentos',
      color: 'bg-green-500',
      action: () => onNavigate('service-orders'),
    },
    {
      title: 'Chat',
      icon: MessageCircle,
      description: 'Atendimento e suporte via chat',
      color: 'bg-indigo-500',
      action: () => onNavigate('chat'),
    },
    {
      title: 'Dashboard',
      icon: BarChart3,
      description: 'Análise e métricas do negócio',
      color: 'bg-purple-500',
      action: () => console.log('Dashboard'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Sistema de Gestão</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((module, index) => (
          <button
            key={index}
            onClick={module.action}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${module.color}`}>
                <module.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">{module.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{module.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}