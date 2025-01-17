import React from 'react';
import { Chat } from '../types/chat';
import { format } from 'date-fns';
import { MessageCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

export function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  const statusColors = {
    open: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className={cn(
            'w-full p-4 text-left hover:bg-gray-50 border-b transition-colors',
            selectedChat?.id === chat.id && 'bg-indigo-50 hover:bg-indigo-50'
          )}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium text-gray-900 truncate">{chat.title}</h3>
            <span className={cn(
              'text-xs px-2 py-1 rounded-full',
              statusColors[chat.status as keyof typeof statusColors]
            )}>
              {chat.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 truncate mb-2">
            {chat.lastMessage || 'Nenhuma mensagem'}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              {chat.unreadCount > 0 && (
                <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                  {chat.unreadCount}
                </span>
              )}
              {chat.serviceOrderId && (
                <span className="flex items-center text-indigo-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  OS #{chat.serviceOrderId}
                </span>
              )}
            </div>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {format(new Date(chat.updatedAt), 'HH:mm')}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}