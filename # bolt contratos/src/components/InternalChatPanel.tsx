import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Send, User } from 'lucide-react';
import { mockData } from '../lib/mockData';
import toast from 'react-hot-toast';

interface InternalChatPanelProps {
  chatId: string;
}

interface InternalMessage {
  id: string;
  chatId: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export function InternalChatPanel({ chatId }: InternalChatPanelProps) {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: internalMessages = [] } = useQuery({
    queryKey: ['internal-messages', chatId],
    queryFn: () => mockData.getInternalMessages(chatId),
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const newMessage: InternalMessage = {
        id: crypto.randomUUID(),
        chatId,
        content: message,
        userId: '1', // ID do usuário logado
        userName: 'João Silva', // Nome do usuário logado
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(['internal-messages', chatId], (old: InternalMessage[]) => [
        ...old,
        newMessage,
      ]);

      setMessage('');
      toast.success('Mensagem interna enviada');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-900">Chat Interno</h3>
        <p className="text-sm text-gray-500">Comunicação entre atendentes</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {internalMessages.map((msg: InternalMessage) => (
          <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-900">
                {msg.userName}
              </span>
            </div>
            <p className="text-sm text-gray-700">{msg.content}</p>
            <span className="text-xs text-gray-400 mt-1 block">
              {format(new Date(msg.createdAt), 'HH:mm')}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mensagem interna..."
            className="flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 text-white bg-gray-600 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}