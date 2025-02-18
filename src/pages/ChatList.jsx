import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  InputBase,
  Paper,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Circle as CircleIcon,
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import ChatLayout from '../layouts/ChatLayout';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { contactsService } from '../services/contactsService';
import { chatHistoryService } from '../services/chatHistoryService';
import chatMessagesService from '../services/chatMessagesService';
import { authService } from '../services/authService';
import AIAssistant from '../components/AIAssistant';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateX(8px)',
    backgroundColor: theme.palette.mode === 'dark'
      ? theme.palette.grey[800]
      : theme.palette.grey[100],
  },
}));

const ChatItem = styled(Paper)(({ theme, selected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  marginBottom: theme.spacing(1), // Espaçamento entre cards
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'scale(1.02)', // Efeito sutil de hover
  },
  ...(selected && {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  }),
}));

const ChatList = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Buscar chats do usuário
  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const chatResponse = await chatMessagesService.getChatList();
      console.log('Resposta da busca de chats:', {
        response: chatResponse,
        data: chatResponse.data,
        type: typeof chatResponse,
        keys: Object.keys(chatResponse || {})
      });
      setChats(chatResponse.data || []);
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar mensagens de um chat específico
  const fetchChatMessages = async (chatId) => {
    try {
      setIsLoading(true);
      const messagesResponse = await chatMessagesService.getChatMessages(chatId);
      setMessages(messagesResponse.data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens do chat:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para buscar chats iniciais
  useEffect(() => {
    fetchChats();
  }, []);

  // Efeito para buscar mensagens quando um chat é selecionado
  useEffect(() => {
    if (selectedChat?.id) {
      fetchChatMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // Buscar contatos
  const searchContacts = async (query) => {
    try {
      const results = await contactsService.searchContacts(query);
      setContacts(results);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      setContacts([]);
    }
  };

  // Atualizar busca quando o termo mudar
  useEffect(() => {
    if (searchTerm.length > 2) {
      searchContacts(searchTerm);
    } else {
      setContacts([]);
    }
  }, [searchTerm]);

  // Método para enviar mensagem
  const handleSendMessage = async (messageContent) => {
    if (!selectedChat) return;

    try {
      const messageData = {
        channelId: selectedChat.channelId || 1,
        chatId: selectedChat.id,
        contactId: selectedChat.contactId,
        content: messageContent,
        contentType: 'TEXT'
      };

      const sentMessage = await chatMessagesService.sendMessage(messageData);
      
      // Atualizar lista de mensagens
      setMessages(prevMessages => [...prevMessages, sentMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Renderização condicional de chats
  const renderChats = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      );
    }

    return chats.map((chat) => {
      // Tratamento para nomes de chat
      const chatName = chat.name || `Chat #${chat.id}`;
      const lastMessageText = chat.lastMessage || 'Nenhuma mensagem enviada';

      return (
        <ChatItem 
          key={chat.id} 
          elevation={selectedChat?.id === chat.id ? 3 : 1}
          selected={selectedChat?.id === chat.id}
          onClick={() => setSelectedChat(chat)}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%',
            gap: 2
          }}>
            <Avatar sx={{ 
              bgcolor: selectedChat?.id === chat.id 
                ? 'primary.main' 
                : 'grey.500' 
            }}>
              {chatName.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="subtitle1" 
                color={selectedChat?.id === chat.id ? 'primary.main' : 'text.primary'}
              >
                {chatName}
              </Typography>
              <Typography 
                variant="body2" 
                color={selectedChat?.id === chat.id ? 'primary.main' : 'text.secondary'}
                sx={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}
              >
                {lastMessageText}
              </Typography>
            </Box>
            
            {chat.unreadCount > 0 && (
              <Box 
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: 24, 
                  height: 24, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Typography variant="caption">
                  {chat.unreadCount}
                </Typography>
              </Box>
            )}
          </Box>
        </ChatItem>
      );
    });
  };

  // Renderização de mensagens
  const renderMessages = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      );
    }

    return messages.map((message, index) => {
      const currentUserId = authService.getCurrentUser()?.id;
      return (
        <ChatMessage
          key={message.id || index}
          message={message}
          isown={message.senderId === currentUserId}
          onReply={() => handleReplyToMessage(message)}
        />
      );
    });
  };

  return (
    <ChatLayout>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
          p: 2,
          gap: 2,
        }}
      >
        {/* Sidebar de chats */}
        <Box
          sx={{
            width: 320,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 1,
          }}
        >
          {/* Barra de busca */}
          <Paper
            component="form"
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Buscar contatos"
              inputProps={{ 'aria-label': 'buscar contatos' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>

          {/* Lista de chats */}
          <Box sx={{ 
            overflowY: 'auto', 
            maxHeight: 'calc(100vh - 200px)', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1 
          }}>
            {renderChats()}
          </Box>
        </Box>

        {/* Área de mensagens */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {selectedChat ? (
            <>
              {/* Header do chat */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar>{selectedChat.name ? selectedChat.name.charAt(0) : '?'}</Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1">{selectedChat.name || 'Chat sem nome'}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Área de mensagens */}
              <Box
                ref={chatContainerRef}
                sx={{
                  flexGrow: 1,
                  p: 2,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'action.hover',
                }}
              >
                {renderMessages()}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input de mensagem */}
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <ChatInput 
                  selectedContact={selectedChat}
                  channelId={selectedChat.channelId || 1}
                  onSendMessage={handleSendMessage}
                />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.paper',
                gap: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Selecione uma conversa para começar
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Desabilitar AIAssistant nesta tela */}
      <AIAssistant disableFloatingChat={true} />
    </ChatLayout>
  );
};

export default ChatList;
