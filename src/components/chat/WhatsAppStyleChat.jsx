import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DocumentPreview from './DocumentPreview';
import chatMessagesService from '../../services/chatMessagesService';
import socketIoService from '../../services/socketIoService';
import { contactsService } from '../../services/contactsService';
import ContactSearch from './ContactSearch';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  InputBase,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Divider,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Message as MessageIcon,
  DonutLarge as StatusIcon,
  ArrowBack as ArrowBackIcon,
  InsertEmoticon as EmojiIcon,
  AttachFile as AttachIcon,
  Mic as MicIcon,
  Send as SendIcon,
  Archive as ArchiveIcon,
  Group as GroupIcon,
  NotificationsOff as MuteIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  ExitToApp as ExitIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componentes estilizados
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const LeftSidebar = styled(Box)(({ theme }) => ({
  width: '70px',
  backgroundColor: '#f0f2f5',
  borderRight: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2, 1),
}));

const SidebarIcon = styled(IconButton)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: '#54656f',
  '&:hover': {
    backgroundColor: '#e9edef',
  },
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '30%',
  minWidth: 300,
  maxWidth: 420,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: '#f0f2f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const SearchBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: '#ffffff',
}));

const SearchInput = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 2),
  borderRadius: 8,
  backgroundColor: '#f0f2f5',
  '&:hover': {
    backgroundColor: '#e9edef',
  },
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  gap: theme.spacing(1),
  backgroundColor: '#ffffff',
}));

const FilterButton = styled(Button)(({ theme, active }) => ({
  textTransform: 'none',
  borderRadius: 16,
  padding: theme.spacing(0.5, 2),
  backgroundColor: active ? '#e9edef' : 'transparent',
  color: '#54656f',
  '&:hover': {
    backgroundColor: '#e9edef',
  },
}));

const ChatListItem = styled(ListItem)(({ theme, selected }) => ({
  cursor: 'pointer',
  padding: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: '#f5f6f6',
  },
  ...(selected && {
    backgroundColor: '#f0f2f5',
  }),
  '& .MuiListItemText-primary': {
    fontWeight: 500,
    fontSize: '1rem',
    color: '#111b21',
  },
  '& .MuiListItemText-secondary': {
    color: '#667781',
    fontSize: '0.875rem',
  },
}));

const UnreadBadge = styled(Box)(({ theme }) => ({
  backgroundColor: '#25d366',
  color: '#fff',
  borderRadius: '50%',
  padding: '4px 8px',
  fontSize: '0.75rem',
  minWidth: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '4px',
}));

const ChatMainArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#efeae2',
  backgroundImage: 'url("/chat-background.png")',
  backgroundRepeat: 'repeat',
  position: 'relative',
}));

const MessageInputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: '#f0f2f5',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const NotificationBanner = styled(Box)(({ theme }) => ({
  backgroundColor: '#a3e2cf',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

// Dados mockados enquanto a API não está pronta
const mockChats = {
  items: [
    {
      id: 211,
      name: "Wanderley Antigo",
      lastMessage: {
        content: "joia",
        type: "TEXT",
        fileUrl: null,
        status: "UNREAD",
        timestamp: "2025-02-20T22:27:35.266Z"
      },
      unreadCount: "0",
      avatar: "",
      isGroup: false,
      isMuted: false,
      isPinned: false,
      channelType: "zap6595"
    },
    {
      id: 210,
      name: "Grupo 210",
      lastMessage: {
        content: "",
        type: "TEXT",
        fileUrl: null,
        status: "UNREAD",
        timestamp: "2025-02-20T22:19:43.163Z"
      },
      unreadCount: "0",
      avatar: "",
      isGroup: false,
      isMuted: false,
      isPinned: false,
      channelType: "zap6595"
    }
  ],
  meta: {
    totalItems: 2,
    itemCount: 2,
    itemsPerPage: 20,
    totalPages: 1,
    currentPage: 1
  }
};

const fetchChats = async () => {
  console.log('Chamando fetchChats para obter dados dos chats'); // Log antes da chamada
  try {
    // Utilizando o serviço de mensagens de chat para obter a lista de chats
    const response = await chatMessagesService.getChatList();
    console.log('Resposta do serviço de chat:', response); // Log para verificar a resposta
    
    if (!response || !response.items) {
      console.error('Formato de resposta inválido:', response);
      return [];
    }
    
    // Log para debug da estrutura recebida
    if (response.items.length > 0) {
      console.log('Estrutura do primeiro item:', response.items[0]);
    }

    // Mapear os itens para o formato esperado pelo componente
    return response.items.map(item => {
      // Log para debug
      console.log('Processando chat:', {
        id: item.id,
        name: item.name,
        lastContactId: item.lastContactId
      });

      return {
        id: item.id,
        name: item.name || `Chat #${item.id}`,
        channelId: item.channel_id,
        contactId: item.lastContactId,
        lastMessage: item.lastMessage?.content || 'Sem mensagens',
        time: item.lastMessage?.timestamp
          ? new Date(item.lastMessage.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : '',
        unread: parseInt(item.unreadCount || '0'),
        avatar: item.avatar,
        isGroup: item.isGroup || false,
        isMuted: item.isMuted || false,
        isPinned: item.isPinned || false,
        channelType: item.channelType,
        status: (item.lastMessage?.status || 'pending').toLowerCase(),
        contactValue: item.contactValue
      };
    });
  } catch (error) {
    console.error('Erro ao buscar chats:', error);
    return [];
  }
};

const WhatsAppStyleChat = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const messageContainerRef = useRef(null);

  // Estado para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  // Buscar chats ao montar o componente
  useEffect(() => {
    const loadChats = async () => {
      const chatsData = await fetchChats();
      setChats(chatsData);
    };
    loadChats();
  }, []);

  const handleCloseChat = async () => {
    try {
      if (!selectedChat?.id) return;

      // TODO: Quando tivermos a API, substituir por chamada real
      // await chatService.updateStatus(selectedChat.id, 'closed');
      
      // Atualiza o estado local do chat
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id 
            ? { 
                ...chat, 
                status: 'closed' 
              }
            : chat
        )
      );

      // Fecha o chat atual
      setSelectedChat(null);
    } catch (error) {
      console.error('Erro ao fechar o chat:', error);
      // TODO: Adicionar notificação de erro quando tivermos o componente
    }
  };

  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState({});
  const [wsConnected, setWsConnected] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [activeListeners, setActiveListeners] = useState({
    message: null,
    typing: null
  });
  const typingTimeoutRef = useRef(null);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Função para iniciar um novo chat com um contato
  const handleContactSelect = async (contact) => {
    try {
      console.log('Iniciando chat com contato:', contact);
      
      // Verificar se já existe um chat com este contato
      const existingChat = chats.find(chat => 
        chat.contactId === contact.id || 
        chat.contact_id === contact.id
      );
      
      if (existingChat) {
        console.log('Chat existente encontrado:', existingChat);
        handleChatSelect(existingChat);
        return;
      }
      
      // Se não existir, criar um novo chat
      const newChat = {
        id: `new_${contact.id}`,
        name: contact.name,
        contactId: contact.id,
        lastMessage: 'Novo chat',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        avatar: null,
        isGroup: false,
        isMuted: false,
        isPinned: false,
      };
      
      // Adicionar o novo chat à lista
      setChats(prevChats => [newChat, ...prevChats]);
      
      // Selecionar o novo chat
      handleChatSelect(newChat);
    } catch (error) {
      console.error('Erro ao iniciar chat com contato:', error);
    }
  };

  const handleChatSelect = async (chat) => {
    if (!chat?.id) {
      console.warn('Chat inválido selecionado:', chat);
      return;
    }

    try {
      setLoadingMessages(true);
      
      // Verificar token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('Token não encontrado');
        navigate('/login');
        return;
      }
      
      // Entrar na sala de chat via Socket.IO
      if (socketIoService.isConnected) {
        socketIoService.joinChat(chat.id);
        console.log(`Entrando na sala de chat ${chat.id} via Socket.IO`);
        
        // Configurar listener para novas mensagens neste chat
        const removeMessageListener = socketIoService.onChatEvent(chat.id, 'message', (data) => {
          console.log(`Nova mensagem recebida para o chat ${chat.id}:`, data);
          // Adicionar a nova mensagem ao estado
          const newMessage = data.data || data;
          setChatMessages(prevMessages => [...prevMessages, newMessage]);
          // Rolar para a última mensagem
          setTimeout(() => scrollToBottom(), 100);
        });
        
        // Configurar listener para eventos de digitação
        const removeTypingListener = socketIoService.onChatEvent(chat.id, 'typing', (data) => {
          console.log(`Evento de digitação para o chat ${chat.id}:`, data);
          setIsTyping(data.isTyping);
          if (data.isTyping) {
            // Limpar timeout anterior se existir
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            // Definir novo timeout para esconder o indicador após 3 segundos
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          }
        });
        
        // Armazenar as funções de remoção para limpar quando mudar de chat
        setActiveListeners(prev => {
          // Limpar listeners anteriores
          if (prev.message) prev.message();
          if (prev.typing) prev.typing();
          
          return {
            message: removeMessageListener,
            typing: removeTypingListener
          };
        });
      } else {
        console.warn('Socket.IO não está conectado, não é possível entrar na sala de chat');
      }
      
      // Buscar mensagens
      const response = await chatMessagesService.getChatMessages(chat.id, {
        page: 1,
        limit: 50
      });
      
      // Validar resposta
      if (!response?.data && !response?.items) {
        console.warn('Resposta vazia do serviço');
        return;
      }
      
      // Processar mensagens
      const messages = response.data || response.items || [];
      console.log(`Carregadas ${messages.length} mensagens para o chat ${chat.id}`);

      // Atualizar estado com o chat completo
      setSelectedChat(chat);
      setChatMessages(messages);

      console.log('Chat selecionado:', chat);
      
      // Rolar para a última mensagem após um pequeno delay para garantir renderização
      setTimeout(scrollToBottom, 200);
      
      // Verificar se estamos usando dados mockados
      if (response.meta && response.meta.isMock) {
        setUsingMockData(true);
      }
    } catch (error) {
      console.error('Erro detalhado ao buscar mensagens:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      setSelectedChat(chat);
      setChatMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    // Inicializar o WebSocket e registrar callback para mudanças na conexão
    const unsubscribeConnection = chatMessagesService.websocketService?.onConnectionChange((connected) => {
      setWsConnected(connected);
      console.log(`WebSocket ${connected ? 'conectado' : 'desconectado'}`);
    });
    
    // Limpar os listeners ao desmontar
    return () => {
      // Limpar o listener de conexão
      if (unsubscribeConnection) {
        unsubscribeConnection();
      }
    };
  }, []);

  useEffect(() => {
    // Inicializar Socket.IO quando o componente for montado
    const initializeSocketIo = async () => {
      try {
        console.log('Inicializando Socket.IO no componente de chat');
        await socketIoService.connect();
        console.log('Socket.IO conectado com sucesso');
        
        // Registrar callback para mudanças na conexão
        const removeConnectionListener = socketIoService.onConnectionChange((isConnected, error) => {
          console.log(`Estado da conexão Socket.IO alterado: ${isConnected ? 'Conectado' : 'Desconectado'}`);
          setWsConnected(isConnected);
          
          if (error) {
            console.error('Erro na conexão Socket.IO:', error);
          }
        });
        
        return () => {
          // Limpar listener quando o componente for desmontado
          if (removeConnectionListener) removeConnectionListener();
        };
      } catch (error) {
        console.error('Erro ao inicializar Socket.IO:', error);
      }
    };
    
    initializeSocketIo();
    
    // Limpar listeners e desconectar Socket.IO quando o componente for desmontado
    return () => {
      // Limpar listeners ativos
      if (activeListeners.message) activeListeners.message();
      if (activeListeners.typing) activeListeners.typing();
      
      // Não desconectar o Socket.IO aqui para manter a conexão em outras partes do app
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      // Registrar novo listener para mensagens
      const unsubscribeMessage = chatMessagesService.onNewMessage(
        selectedChat.id,
        (newMessage) => {
          console.log('Nova mensagem recebida para o chat atual:', newMessage);
          console.log('Estrutura completa da nova mensagem:', JSON.stringify(newMessage, null, 2));
          
          // Verificar se a mensagem já existe para evitar duplicação
          setChatMessages(prevMessages => {
            // Verificar se a mensagem já existe usando diferentes IDs possíveis
            const messageId = newMessage.id || newMessage.message_id;
            const messageExists = prevMessages.some(msg => 
              (msg.id === messageId) || 
              (msg.message_id === messageId) ||
              (msg.id === newMessage.message_id) ||
              (msg.message_id === newMessage.id)
            );
            
            if (messageExists) {
              console.log(`Mensagem ${messageId} já existe no chat, ignorando`);
              return prevMessages;
            }
            
            console.log(`Adicionando nova mensagem ${messageId} ao chat`);
            
            // Processar a mensagem para garantir formato consistente
            const processedMessage = {
              id: messageId,
              message_id: messageId,
              chat_id: selectedChat.id,
              content: newMessage.content,
              contentType: newMessage.contentType || newMessage.type || 'TEXT',
              direction: newMessage.direction || (newMessage.sender === 'me' ? 'OUTBOUND' : 'INBOUND'),
              sender: newMessage.sender || (newMessage.direction === 'OUTBOUND' ? 'me' : 'them'),
              timestamp: newMessage.timestamp || newMessage.createdAt || new Date().toISOString(),
              status: newMessage.status || 'received',
              // Campos para arquivos/documentos
              fileUrl: newMessage.fileUrl,
              fileName: newMessage.fileName,
              fileType: newMessage.fileType
            };
            
            // Adicionar a nova mensagem
            const updatedMessages = [...prevMessages, processedMessage];
            
            // Rolar para a última mensagem após um pequeno delay
            setTimeout(scrollToBottom, 100);
            
            return updatedMessages;
          });
        }
      );
      
      // Registrar listener para indicadores de digitação
      const unsubscribeTyping = chatMessagesService.onTypingIndicator(
        selectedChat.id,
        (typingData) => {
          console.log('Indicador de digitação recebido:', typingData);
          
          // Atualizar o estado de digitação remota
          setRemoteTyping(prev => ({
            ...prev,
            [selectedChat.id]: {
              isTyping: typingData.isTyping,
              timestamp: new Date()
            }
          }));
          
          // Limpar o indicador após 3 segundos se não receber atualização
          if (typingData.isTyping) {
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
              setRemoteTyping(prev => ({
                ...prev,
                [selectedChat.id]: {
                  isTyping: false,
                  timestamp: new Date()
                }
              }));
            }, 3000);
          }
        }
      );
      
      // Armazenar referências para limpar ao desmontar
      setActiveListeners({
        message: unsubscribeMessage,
        typing: unsubscribeTyping
      });
      
      // Limpar listeners quando o componente for desmontado ou o chat mudar
      return () => {
        if (unsubscribeMessage) unsubscribeMessage();
        if (unsubscribeTyping) unsubscribeTyping();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }
  }, [selectedChat]);

  useEffect(() => {
    // Limpar listeners quando o componente for desmontado
    return () => {
      // Limpar todos os listeners ativos
      if (activeListeners.message) activeListeners.message();
      if (activeListeners.typing) activeListeners.typing();
      
      // Limpar timeout de digitação
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Sair do chat atual se estiver selecionado
      if (selectedChat?.id) {
        socketIoService.leaveChat(selectedChat.id);
        console.log(`Saindo da sala de chat ${selectedChat.id} via Socket.IO`);
      }
    };
  }, [activeListeners, selectedChat]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    // Enviar evento de digitação
    if (selectedChat && socketIoService.isConnected) {
      if (!isTyping) {
        setIsTyping(true);
        socketIoService.sendTypingEvent(selectedChat.id, true);
      }
      
      // Limpar timeout anterior se existir
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Definir novo timeout para enviar evento de "parou de digitar" após 2 segundos
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (socketIoService.isConnected) {
          socketIoService.sendTypingEvent(selectedChat.id, false);
        }
      }, 2000);
    }
  };

  // Função para rolar para a última mensagem
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      console.log('Rolando para a última mensagem');
      const container = messageContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Efeito para rolar para a última mensagem quando as mensagens são carregadas ou atualizadas
  useEffect(() => {
    if (chatMessages.length > 0) {
      // Pequeno timeout para garantir que o DOM foi atualizado
      setTimeout(scrollToBottom, 100);
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    
    try {
      // Verificar se o chat tem contactId ou lastContactId
      if (!selectedChat.contactId && !selectedChat.lastContactId) {
        console.error('Erro: Chat não possui contactId ou lastContactId');
        setSnackbarMessage('Erro ao enviar mensagem: dados de contato incompletos.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Adicionar a mensagem localmente com um ID temporário
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempId,
        content: message,
        contentType: 'TEXT',
        direction: 'OUTBOUND',
        sender: 'me',
        createdAt: new Date().toISOString(),
        status: 'sending'
      };
      
      // Adicionar a mensagem temporária ao estado
      setChatMessages(prev => [...prev, tempMessage]);
      
      // Limpar o campo de mensagem
      setMessage('');
      
      // Rolar para a última mensagem
      setTimeout(() => scrollToBottom(), 100);
      
      // Preparar dados da mensagem
      const messageData = {
        content: message,
        contentType: 'TEXT',
        contactId: selectedChat.lastContactId || selectedChat.contactId,
        channelId: selectedChat.channel_id || selectedChat.channelId || 6
      };
      
      console.log('Enviando mensagem:', {
        chatId: selectedChat.id,
        messageData
      });
      
      // Enviar a mensagem
      const response = await chatMessagesService.sendMessage(selectedChat.id, messageData);
      console.log('Resposta do envio de mensagem:', response);
      
      // Verificar se a resposta contém um erro
      if (response && response.status === 'error') {
        throw new Error(response.error || 'Erro ao enviar mensagem');
      }
      
      // Atualizar a mensagem temporária com os dados da resposta
      setChatMessages(prev => prev.map(msg => 
        msg && msg.id === tempId 
          ? { 
              ...msg, 
              id: response.id || msg.id,
              status: 'sent',
              createdAt: response.timestamp || response.createdAt || msg.createdAt
            }
          : msg
      ));
      
      // Mostrar mensagem de sucesso
      setSnackbarMessage('Mensagem enviada com sucesso.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Atualizar o status da mensagem temporária para erro
      setChatMessages(prev => prev.map(msg => 
        msg && msg.id && typeof msg.id === 'string' && msg.id.startsWith('temp-') 
          ? { ...msg, status: 'error' }
          : msg
      ));
      
      // Mostrar mensagem de erro
      setSnackbarMessage(`Erro ao enviar mensagem: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Função para reenviar uma mensagem que falhou
  const handleResendMessage = async (message) => {
    try {
      console.log('Tentando reenviar mensagem:', message);
      
      // Verificar se o chat tem contactId ou lastContactId
      if (!selectedChat.contactId && !selectedChat.lastContactId) {
        console.error('Erro: Chat não possui contactId ou lastContactId');
        setSnackbarMessage('Erro ao reenviar mensagem: dados de contato incompletos.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Atualizar o status da mensagem para 'sending'
      setChatMessages(prev => prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, status: 'sending' }
          : msg
      ));
      
      // Preparar dados da mensagem
      const messageData = {
        content: message.content,
        contentType: message.contentType || 'TEXT',
        contactId: selectedChat.lastContactId || selectedChat.contactId,
        channelId: selectedChat.channel_id || selectedChat.channelId || 6
      };
      
      console.log('Reenviando mensagem:', {
        chatId: selectedChat.id,
        messageData
      });
      
      // Enviar a mensagem
      const response = await chatMessagesService.sendMessage(selectedChat.id, messageData);
      console.log('Resposta do reenvio de mensagem:', response);
      
      // Verificar se a resposta contém um erro
      if (response && response.status === 'error') {
        throw new Error(response.error || 'Erro ao reenviar mensagem');
      }
      
      // Atualizar a mensagem com os dados da resposta
      setChatMessages(prev => prev.map(msg => 
        msg.id === message.id 
          ? { 
              ...msg, 
              id: response.id || msg.id,
              status: 'sent',
              createdAt: response.timestamp || response.createdAt || msg.createdAt
            }
          : msg
      ));
      
      // Mostrar mensagem de sucesso
      setSnackbarMessage('Mensagem reenviada com sucesso.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao reenviar mensagem:', error);
      
      // Atualizar o status da mensagem para erro
      setChatMessages(prev => prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, status: 'error' }
          : msg
      ));
      
      // Mostrar mensagem de erro
      setSnackbarMessage(`Erro ao reenviar mensagem: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <ChatContainer>
      <LeftSidebar>
        <SidebarIcon>
          <MessageIcon />
        </SidebarIcon>
        <SidebarIcon>
          <GroupIcon />
        </SidebarIcon>
        <SidebarIcon>
          <ArchiveIcon />
        </SidebarIcon>
        <SidebarIcon>
          <MuteIcon />
        </SidebarIcon>
        <SidebarIcon>
          <SettingsIcon />
        </SidebarIcon>
        <Box sx={{ marginTop: 'auto' }}>
          <SidebarIcon onClick={() => navigate(-1)}>
            <ExitIcon />
          </SidebarIcon>
        </Box>
      </LeftSidebar>

      <SidebarContainer>
        <Header>
          <Avatar />
          <Box>
            <IconButton>
              <StatusIcon />
            </IconButton>
            <IconButton>
              <MessageIcon />
            </IconButton>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Header>

        <NotificationBanner>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon sx={{ color: '#2d3a41' }} />
            <Typography>Ative a sincronização em segundo plano</Typography>
          </Box>
          <IconButton size="small" sx={{ color: '#2d3a41' }}>
            <AddIcon />
          </IconButton>
        </NotificationBanner>
        
        <ContactSearch onContactSelect={handleContactSelect} />

        <FilterContainer>
          <FilterButton
            sx={{
              backgroundColor: activeFilter === 'todas' ? 'primary.main' : 'transparent',
              color: activeFilter === 'todas' ? 'white' : 'inherit'
            }}
            onClick={() => handleFilterChange('todas')}
          >
            Tudo
          </FilterButton>
          <FilterButton
            sx={{
              backgroundColor: activeFilter === 'nao-lidas' ? 'primary.main' : 'transparent',
              color: activeFilter === 'nao-lidas' ? 'white' : 'inherit'
            }}
            onClick={() => handleFilterChange('nao-lidas')}
          >
            Não lidas
          </FilterButton>
          <FilterButton
            sx={{
              backgroundColor: activeFilter === 'favoritas' ? 'primary.main' : 'transparent',
              color: activeFilter === 'favoritas' ? 'white' : 'inherit'
            }}
            onClick={() => handleFilterChange('favoritas')}
          >
            Favoritas
          </FilterButton>
          <FilterButton
            sx={{
              backgroundColor: activeFilter === 'grupos' ? 'primary.main' : 'transparent',
              color: activeFilter === 'grupos' ? 'white' : 'inherit'
            }}
            onClick={() => handleFilterChange('grupos')}
          >
            Grupos
          </FilterButton>
        </FilterContainer>

        <List sx={{ flex: 1, overflow: 'auto' }}>
          {chats
            .filter(chat => {
              if (activeFilter === 'todas') return true;
              if (activeFilter === 'nao-lidas') return chat.unread > 0;
              if (activeFilter === 'favoritas') return chat.isPinned;
              if (activeFilter === 'grupos') return chat.isGroup;
              return true;
            })
            .map(chat => (
              <React.Fragment key={chat.id}>
                <ChatListItem
                  selected={selectedChat?.id === chat.id}
                  onClick={() => handleChatSelect(chat)}
                >
                  <ListItemAvatar>
                    <Avatar src={chat.avatar}>
                      {!chat.avatar && chat.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={chat.name}
                    secondary={chat.lastMessage}
                    secondaryTypographyProps={{
                      noWrap: true,
                      style: { maxWidth: '70%' }
                    }}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '65px' }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: chat.unread > 0 ? '#25d366' : '#667781',
                        fontSize: '0.75rem'
                      }}
                    >
                      {chat.time}
                    </Typography>
                    {chat.unread > 0 && (
                      <UnreadBadge>
                        {chat.unread}
                      </UnreadBadge>
                    )}
                  </Box>
                </ChatListItem>
                <Divider />
              </React.Fragment>
            ))
          }
        </List>
      </SidebarContainer>

      <ChatMainArea>
        {selectedChat ? (
          <>
            <Header>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar src={selectedChat.avatar}>
                  {!selectedChat.avatar && selectedChat.name.charAt(0)}
                </Avatar>
                <Typography variant="subtitle1">{selectedChat.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton>
                  <SearchIcon />
                </IconButton>
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
                <IconButton 
                  onClick={handleCloseChat} 
                  title="Fechar chat"
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 0, 0, 0.04)' 
                    } 
                  }}
                >
                  <CloseIcon color="error" />
                </IconButton>
              </Box>
            </Header>

            <Box 
              ref={messageContainerRef} 
              sx={{ 
                flex: 1, 
                overflow: 'auto', 
                padding: 2,
                scrollBehavior: 'smooth' // Adiciona animação de rolagem suave
              }}
            >
              {usingMockData && (
                <Box sx={{ mb: 2, p: 1, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeeba' }}>
                  <Typography variant="body2" color="warning.dark">
                    Usando dados mockados devido a um erro na API.
                  </Typography>
                </Box>
              )}
              
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
                  <Typography>Carregando mensagens...</Typography>
                </Box>
              ) : (
                [...chatMessages].reverse().map((msg, index) => {
                  const isOutbound = msg.direction === 'OUTBOUND';
                  
                  // Log detalhado para as primeiras mensagens
                  if (index < 3) {
                    console.log(`Mensagem ${index} completa:`, msg);
                  }
                  
                  // Garantir que contentType seja definido
                  if (!msg.contentType) {
                    if (msg.content_type) {
                      msg.contentType = msg.content_type;
                    } else if (msg.type) {
                      if (msg.type.toUpperCase() === 'DOCUMENT' || msg.type.toLowerCase() === 'document') {
                        msg.contentType = 'DOCUMENT';
                      } else if (msg.type.toUpperCase() === 'FILE' || msg.type.toLowerCase() === 'file') {
                        msg.contentType = 'FILE';
                      } else {
                        msg.contentType = 'TEXT';
                      }
                    } else {
                      msg.contentType = 'TEXT';
                    }
                  }
                  
                  // Verificar tipos de mensagem
                  const isDocument = 
                    msg.isDocument || 
                    msg.is_document ||
                    (msg.contentType && msg.contentType.toUpperCase() === 'DOCUMENT') || 
                    (msg.content_type && msg.content_type.toUpperCase() === 'DOCUMENT') || 
                    (msg.type && (msg.type.toLowerCase() === 'document' || msg.type.toUpperCase() === 'DOCUMENT'));
                  
                  const isFile = 
                    msg.isFile || 
                    msg.is_file ||
                    (msg.contentType && msg.contentType.toUpperCase() === 'FILE') || 
                    (msg.content_type && msg.content_type.toUpperCase() === 'FILE') || 
                    (msg.type && (msg.type.toLowerCase() === 'file' || msg.type.toUpperCase() === 'FILE')) || 
                    !!msg.fileUrl || 
                    !!(msg.metadata && msg.metadata.fileUrl);
                  
                  // Verificar se há URL no conteúdo da mensagem
                  let fileUrl = msg.fileUrl || 
                              (msg.metadata && msg.metadata.fileUrl) || 
                              msg.document?.url || 
                              msg.url || 
                              '';
                  let hasUrlInContent = false;
                  
                  if (!fileUrl && msg.content && typeof msg.content === 'string' && msg.content.includes('http')) {
                    const urlMatch = msg.content.match(/(https?:\/\/[^\s]+)/g);
                    if (urlMatch && urlMatch.length > 0) {
                      fileUrl = urlMatch[0];
                      hasUrlInContent = true;
                    }
                  }
                  
                  const hasFileUrl = !!fileUrl;
                  
                  // Determinar o tipo de arquivo baseado na extensão
                  let fileType = msg.fileType || 'document';
                  
                  if (fileUrl) {
                    const extension = fileUrl.split('.').pop().toLowerCase();
                    if (['pdf'].includes(extension)) {
                      fileType = 'pdf';
                    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                      fileType = 'image';
                    } else if (['doc', 'docx'].includes(extension)) {
                      fileType = 'document';
                    }
                  }
                  
                  const isImage = fileType === 'image';
                  const isPdf = fileType === 'pdf';
                  
                  // Determinar se deve mostrar como documento/arquivo
                  const showAsDocument = isDocument || isFile || hasFileUrl || hasUrlInContent;
                  
                  // Log para debug
                  console.log(`Renderizando mensagem ${index}:`, {
                    id: msg.id || msg.message_id,
                    contentType: msg.contentType,
                    isDocument: isDocument || msg.isDocument || false,
                    isFile: isFile || msg.isFile || false,
                    hasFileUrl,
                    hasUrlInContent,
                    fileType,
                    fileUrl,
                    showAsDocument,
                    originalMessage: msg.originalMessage || msg
                  });
                  
                  // Determinar nome do arquivo
                  let filename = msg.document?.filename;
                  if (!filename && fileUrl) {
                    const urlParts = fileUrl.split('/');
                    filename = urlParts[urlParts.length - 1];
                  }
                  
                  return (
                    <Box
                      key={msg.id || msg.message_id || index} // Usar message_id ou índice como fallback para evitar warning de key
                      sx={{
                        display: 'flex',
                        justifyContent: isOutbound ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: isOutbound ? '#d9fdd3' : '#fff',
                          borderRadius: 2,
                          padding: '8px 12px',
                          maxWidth: isImage ? '300px' : '70%',
                          minWidth: showAsDocument ? '250px' : 'auto',
                        }}
                      >
                        {/* Renderizar documento ou arquivo */}
                        {showAsDocument ? (
                          <DocumentPreview 
                            document={{
                              filename: filename || msg.document?.filename || (msg.content?.split('\n')[0] || 'Documento').substring(0, 30),
                              url: fileUrl,
                              type: fileType
                            }} 
                          />
                        ) : (
                          // Mensagem de texto normal
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}
                          >
                            {msg.content}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5 }}>
                          {/* Indicador de status da mensagem */}
                          {isOutbound && (
                            <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                              {msg.status === 'error' && (
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => handleResendMessage(msg)}
                                  title="Erro ao enviar. Clique para tentar novamente"
                                  sx={{ p: 0.5 }}
                                >
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              )}
                              {msg.status === 'sending' && (
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    display: 'inline-block',
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    border: '2px solid #9e9e9e',
                                    borderTopColor: 'transparent',
                                    animation: 'spin 1s linear infinite',
                                    '@keyframes spin': {
                                      '0%': { transform: 'rotate(0deg)' },
                                      '100%': { transform: 'rotate(360deg)' }
                                    }
                                  }}
                                />
                              )}
                              {msg.status === 'sent' && (
                                <Box component="span" sx={{ color: '#8c8c8c', fontSize: '1rem', lineHeight: 1 }}>
                                  ✓
                                </Box>
                              )}
                              {msg.status === 'delivered' && (
                                <Box component="span" sx={{ color: '#8c8c8c', fontSize: '1rem', lineHeight: 1 }}>
                                  ✓✓
                                </Box>
                              )}
                              {msg.status === 'read' && (
                                <Box component="span" sx={{ color: '#53bdeb', fontSize: '1rem', lineHeight: 1 }}>
                                  ✓✓
                                </Box>
                              )}
                            </Box>
                          )}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#667781', 
                              display: 'block',
                              ml: 0.5
                            }}
                          >
                            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>

            {/* Indicador de digitação */}
            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Digitando...
                </Typography>
                <Box sx={{ display: 'flex', ml: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      animation: 'typing-dot 1s infinite',
                      animationDelay: '0s',
                      '@keyframes typing-dot': {
                        '0%, 60%, 100%': { opacity: 0.4, transform: 'scale(0.8)' },
                        '30%': { opacity: 1, transform: 'scale(1)' },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      animation: 'typing-dot 1s infinite',
                      animationDelay: '0.2s',
                      ml: 0.5,
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      animation: 'typing-dot 1s infinite',
                      animationDelay: '0.4s',
                      ml: 0.5,
                    }}
                  />
                </Box>
              </Box>
            )}

            <MessageInputContainer>
              <IconButton>
                <EmojiIcon />
              </IconButton>
              <IconButton>
                <AttachIcon />
              </IconButton>
              <InputBase
                fullWidth
                multiline
                maxRows={4}
                placeholder="Digite uma mensagem"
                value={message}
                onChange={handleMessageChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: 2,
                  padding: '8px 16px',
                }}
              />
              <IconButton onClick={handleSendMessage}>
                {message.trim() ? <SendIcon /> : <MicIcon />}
              </IconButton>
            </MessageInputContainer>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#54656f',
            }}
          >
            <Typography variant="h6">
              Selecione um chat para começar
            </Typography>
            {usingMockData && (
              <Typography variant="body2" sx={{ color: 'red' }}>
                Usando dados mockados
              </Typography>
            )}
          </Box>
        )}
      </ChatMainArea>
      
      {/* Snackbar para mensagens de feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ChatContainer>
  );
};

export default WhatsAppStyleChat;
