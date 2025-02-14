import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaMoneyBillWave,   // Finanças
  FaComments,        // Chat/Atendimento
  FaUserTie,         // CRM
  FaTasks,           // Tarefas
  FaClipboardList    // Ordem de Serviço
} from 'react-icons/fa';

interface SystemCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  isDisabled?: boolean;
  bgColor: string;
}

const SystemCard: React.FC<SystemCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  route, 
  isDisabled = false,
  bgColor
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isDisabled) {
      navigate(route);
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300
        ${isDisabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:shadow-2xl'}
        p-6 flex flex-col justify-between
      `}
      style={{ 
        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}cc)`,
        minHeight: '250px'
      }}
    >
      <div className="absolute top-0 right-0 opacity-20">
        <Icon className="text-8xl text-white" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white text-opacity-80">{description}</p>
      </div>
      
      {isDisabled && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
          Em breve
        </div>
      )}
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const systems: SystemCardProps[] = [
    {
      title: 'Finanças',
      description: 'Gerencie suas finanças pessoais e empresariais',
      icon: FaMoneyBillWave,
      route: '/dashboard/finance',
      bgColor: '#2C74B3'
    },
    {
      title: 'Atendimento',
      description: 'Sistema de chat e comunicação com clientes',
      icon: FaComments,
      route: '/chat',
      isDisabled: true,
      bgColor: '#4CAF50'
    },
    {
      title: 'CRM',
      description: 'Gestão de relacionamento com clientes',
      icon: FaUserTie,
      route: '/crm',
      isDisabled: true,
      bgColor: '#FF9800'
    },
    {
      title: 'Ordem de Serviço',
      description: 'Controle de ordens de serviço',
      icon: FaClipboardList,
      route: '/service-order',
      isDisabled: true,
      bgColor: '#9C27B0'
    },
    {
      title: 'Tarefas',
      description: 'Gerenciamento de tarefas e projetos',
      icon: FaTasks,
      route: '/tasks',
      isDisabled: true,
      bgColor: '#E91E63'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex flex-col justify-center">
      <div className="container mx-auto max-w-6xl">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold text-center mb-16 text-gray-800"
        >
          Bem-vindo ao <span className="text-blue-600">Agile Finance</span>
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {systems.map((system, index) => (
            <SystemCard key={index} {...system} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
