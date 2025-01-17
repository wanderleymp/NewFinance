import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Chat, Message } from '../types/chat';
import { mockData } from '../lib/mockData';
import { format } from 'date-fns';
import { 
  MoreVertical, 
  Send, 
  Paperclip, 
  Pause,
  Play,
  X,
  Link as LinkIcon,
  AlertCircle,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { ServiceOrder } from '../types/serviceOrder';
import { ServiceOrderModal } from './ServiceOrderModal';
import { CloseServiceOrderModal } from './CloseServiceOrderModal';
import { InternalChatPanel } from './InternalChatPanel';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  chat: Chat;
  onLinkServiceOrder: (serviceOrderId: string) => void;
}

export function ChatWindow({ chat, onLinkServiceOrder }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isServiceOrderModalOpen, setIsServiceOrderModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', chat.id],
    queryFn: () => mockData.getChatMessages(chat.id),
  });

  const { data: serviceOrder } = useQuery({
    queryKey: ['service-order', chat.serviceOrderId],
    queryFn: () => chat.serviceOrderId ? mockData.getServiceOrder(chat.serviceOrderId) : null,
    enabled: !!chat.serviceOrderId,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => mockData.getUsers(),
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const newMessage = {
        id: crypto.randomUUID(),
        chatId: chat.id,
        content: message,
        senderId: '1', // ID do usuário logado
        senderType: 'agent',
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(['chat-messages', chat.id], (old: Message[]) => [
        ...old,
        newMessage,
      ]);

      setMessage('');
      toast.success('Mensagem enviada');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handlePauseChat = async () => {
    try {
      queryClient.setQueryData(['chats'], (old: Chat[]) =>
        old.map(c =>
          c.id === chat.id ? { ...c, status: 'paused' } : c
        )
      );
      toast.success('Conversa pausada');
      setShowOptions(false);
    } catch (error) {
      toast.error('Erro ao pausar conversa');
    }
  };

  const handleResumeChat = async () => {
    try {
      queryClient.setQueryData(['chats'], (old: Chat[]) =>
        old.map(c =>
          c.id === chat.id ? { ...c, status: 'open' } : c
        )
      );
      toast.success('Conversa retomada');
      setShowOptions(false);
    } catch (error) {
      toast.error('Erro ao retomar conversa');
    }
  };

  const handleCloseChat = async (closeData: any) => {
    try {
      if (chat.serviceOrderId) {
        queryClient.setQueryData(['service-orders'], (old: ServiceOrder[]) =>
          old.map(so =>
            so.id === chat.serviceOrderId
              ? {
                  ...so,
                  status: 'completed',
                  closedAt: new Date().toISOString(),
                  solution: closeData.solution,
                  closingNotes: closeData.notes
                }
              : so
          )
        );
      }

      queryClient.setQueryData(['chats'], (old: Chat[]) =>
        old.map(c =>
          c.id === chat.id ? { ...c, status: 'closed' } : c
        )
      );

      toast.success('Conversa e OS encerradas com sucesso');
      setIsCloseModalOpen(false);
      setShowOptions(false);
    } catch (error) {
      toast.error('Erro ao encerrar conversa');
    }
  };

  const getSenderName = (senderId: string, senderType: string) => {
    if (senderType === 'customer') {
      return 'Cliente';
    }
    const user = users.find(u => u.id === senderId);
    return user ? user.name : 'Atendente';
  };

  return (
    <div className="flex flex-1 h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div>
            <h2 className="font-medium text-gray-900">{chat.title}</h2>
            <p className="text-sm text-gray-500">
              {chat.status === 'open' ? 'Conversa ativa' : 
               chat.status === 'paused' ? 'Conversa pausada' : 
               'Conversa encerrada'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInternalChat(!showInternalChat)}
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                showInternalChat 
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat Interno
            </button>

            {serviceOrder ? (
              <button
                onClick={() => setIsServiceOrderModalOpen(true)}
                className="inline-flex items-center text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                OS #{serviceOrder.id}
              </button>
            ) : null}

            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {chat.status === 'open' ? (
                      <button
                        onClick={handlePauseChat}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar Conversa
                      </button>
                    ) : chat.status === 'paused' ? (
                      <button
                        onClick={handleResumeChat}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Retomar Conversa
                      </button>
                    ) : null}

                    {chat.status !== 'closed' && (
                      <button
                        onClick={() => setIsCloseModalOpen(true)}
                        className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Encerrar Conversa
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderType === 'agent' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderType === 'agent'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {getSenderName(message.senderId, message.senderType)}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {format(new Date(message.createdAt), 'HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        {chat.status === 'open' && (
          <div className="p-4 border-t bg-white">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Internal Chat Panel */}
      {showInternalChat && (
        <div className="w-80 border-l bg-white">
          <InternalChatPanel chatId={chat.id} />
        </div>
      )}

      {/* Modals */}
      <ServiceOrderModal
        isOpen={isServiceOrderModalOpen}
        onClose={() => setIsServiceOrderModalOpen(false)}
        serviceOrder={serviceOrder}
        onLinkServiceOrder={onLinkServiceOrder}
      />

      <CloseServiceOrderModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseChat}
      />
    </div>
  );
}