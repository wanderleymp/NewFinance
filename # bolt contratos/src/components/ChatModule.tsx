import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Chat } from '../types/chat';
import { mockData } from '../lib/mockData';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { NewChatModal } from './NewChatModal';
import { MessageCircle, Filter, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export function ChatModule() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [filter, setFilter] = useState('all');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: () => mockData.getChats(),
  });

  const filteredChats = chats.filter(chat => {
    if (filter === 'all') return true;
    if (filter === 'unassigned') return !chat.assignedToId;
    if (filter === 'withOS') return !!chat.serviceOrderId;
    if (filter === 'withoutOS') return !chat.serviceOrderId;
    return chat.status === filter;
  });

  const handleNewChat = async (data: any) => {
    try {
      // Criar OS automaticamente
      const newServiceOrder = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.initialMessage,
        status: 'open',
        priority: 'medium',
        customer: {
          id: data.customerId,
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        },
        openedAt: new Date().toISOString(),
        closedAt: null,
        assignedTo: null,
        serviceType: 'Suporte',
      };

      // Simular criação de nova conversa
      const newChat = {
        id: crypto.randomUUID(),
        title: data.title,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: data.customerId,
        assignedToId: null,
        serviceOrderId: newServiceOrder.id,
        lastMessage: data.initialMessage,
        unreadCount: 0,
      };

      // Atualizar cache
      queryClient.setQueryData(['service-orders'], (old: any[]) => [...(old || []), newServiceOrder]);
      queryClient.setQueryData(['chats'], (old: Chat[]) => [...old, newChat]);

      // Criar primeira mensagem
      const newMessage = {
        id: crypto.randomUUID(),
        chatId: newChat.id,
        content: data.initialMessage,
        senderId: data.customerId,
        senderType: 'customer',
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(['chat-messages', newChat.id], [newMessage]);

      toast.success('Conversa iniciada e OS criada com sucesso!');
      setIsNewChatModalOpen(false);
      setSelectedChat(newChat);
    } catch (error) {
      toast.error('Erro ao iniciar conversa');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Conversas
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nova Conversa
              </button>
            </div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todas as conversas</option>
            <option value="open">Ativas</option>
            <option value="paused">Pausadas</option>
            <option value="closed">Encerradas</option>
            <option value="unassigned">Não atribuídas</option>
            <option value="withOS">Com OS</option>
            <option value="withoutOS">Sem OS</option>
          </select>
        </div>
        <ChatList
          chats={filteredChats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow 
            chat={selectedChat}
            onLinkServiceOrder={(serviceOrderId) => {
              // Atualizar o chat com a OS vinculada
              queryClient.setQueryData(['chats'], (old: Chat[]) =>
                old.map(chat =>
                  chat.id === selectedChat.id
                    ? { ...chat, serviceOrderId }
                    : chat
                )
              );
              setSelectedChat(prev => prev ? { ...prev, serviceOrderId } : null);
              toast.success('OS vinculada com sucesso!');
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Selecione uma conversa
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Escolha uma conversa para visualizar as mensagens ou{' '}
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  inicie uma nova
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSubmit={handleNewChat}
      />
    </div>
  );
}