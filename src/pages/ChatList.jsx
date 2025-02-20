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
  Tooltip
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
  Reply as ReplyIcon,
  DonutLarge as DonutLargeIcon,
  Chat as ChatIcon
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

  // Função para formatar data no estilo WhatsApp
  const formatChatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    // Comparar datas
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  };

  // Renderização condicional de chats no estilo WhatsApp
  const renderChats = () => {
    if (isLoading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%', 
          bgcolor: '#f0f2f5' 
        }}>
          <CircularProgress color="primary" />
        </Box>
      );
    }

    return chats.map((chat) => {
      // Preparar informações do chat
      const chatName = chat.name || `Chat #${chat.id}`;
      const lastMessageText = chat.lastMessage || 'Nenhuma mensagem';
      const lastMessageTime = formatChatTime(chat.createdAt);

      return (
        <Box 
          key={chat.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 15px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: '#f0f2f5'
            },
            backgroundColor: selectedChat?.id === chat.id ? '#e9edef' : 'transparent',
            borderBottom: '1px solid #e9edef'
          }}
          onClick={() => setSelectedChat(chat)}
        >
          {/* Avatar do contato */}
          <Avatar 
            sx={{ 
              width: 50, 
              height: 50, 
              marginRight: 2,
              bgcolor: getChannelColor(chat.channelId)
            }}
          >
            {chatName.charAt(0).toUpperCase()}
          </Avatar>

          {/* Informações do chat */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden' 
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}
              >
                {chatName}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
              >
                {lastMessageTime}
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  flex: 1,
                  marginRight: 1
                }}
              >
                {lastMessageText}
              </Typography>

              {chat.unreadCount > 0 && (
                <Box 
                  sx={{ 
                    backgroundColor: '#25D366', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: 20, 
                    height: 20, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  {chat.unreadCount}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      );
    });
  };

  // Função para obter cor do canal
  const getChannelColor = (channelId) => {
    switch (channelId) {
      case 1: return '#4285F4'; // Email (azul)
      case 2: return '#25D366'; // WhatsApp (verde)
      case 3: return '#FF6B6B'; // SMS (vermelho)
      default: return '#6C757D'; // Neutro (cinza)
    }
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
          backgroundColor: '#f0f2f5'
        }}
      >
        {/* Sidebar de chats */}
        <Box 
          sx={{ 
            width: 400, 
            borderRight: '1px solid #e9edef', 
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Cabeçalho da sidebar */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '10px 15px', 
              backgroundColor: '#f0f2f5',
              borderBottom: '1px solid #e9edef'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Conversas
            </Typography>
            <Box>
              <IconButton>
                <DonutLargeIcon />
              </IconButton>
              <IconButton>
                <ChatIcon />
              </IconButton>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Barra de pesquisa */}
          <Paper 
            component="form" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              margin: '10px 15px', 
              borderRadius: 20,
              boxShadow: 'none',
              border: '1px solid #e9edef'
            }}
          >
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Pesquisar ou começar uma nova conversa"
              inputProps={{ 'aria-label': 'pesquisar contatos' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>

          {/* Lista de chats */}
          <Box 
            sx={{ 
              flex: 1, 
              overflowY: 'auto',
              backgroundColor: 'white'
            }}
          >
            {renderChats()}
          </Box>
        </Box>

        {/* Área de mensagens */}
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#e5ddd5' 
          }}
        >
          {selectedChat ? (
            // Renderização do chat selecionado (manter lógica existente)
            <Box sx={{ flex: 1 }}>
              {renderMessages()}
            </Box>
          ) : (
            // Tela inicial sem chat selecionado
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                backgroundColor: '#f0f2f5'
              }}
            >
              <img 
                src="/path-to-whatsapp-welcome-image.png" 
                alt="WhatsApp Web" 
                style={{ maxWidth: '50%', opacity: 0.5 }}
              />
              <Typography variant="h5" color="text.secondary">
                Mantenha seu celular conectado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                O WhatsApp conecta ao seu telefone para sincronizar suas mensagens
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ChatLayout>
  );
};

export default ChatList;
