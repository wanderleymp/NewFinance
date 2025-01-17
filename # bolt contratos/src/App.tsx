import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Home } from './components/Home';
import { ServiceOrdersPage } from './components/ServiceOrdersPage';
import { ChatModule } from './components/ChatModule';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'service-orders' | 'chat'>('home');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        {currentPage === 'home' ? (
          <Home onNavigate={setCurrentPage} />
        ) : currentPage === 'service-orders' ? (
          <ServiceOrdersPage onNavigateBack={() => setCurrentPage('home')} />
        ) : (
          <ChatModule />
        )}
      </div>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;