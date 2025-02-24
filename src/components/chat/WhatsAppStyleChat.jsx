import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DocumentPreview from './DocumentPreview';
import chatMessagesService from '../../services/chatMessagesService';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
} from '@mui/icons-material';

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
    const { data } = await api.get('/chats');
    console.log('Resposta da API:', data); // Log para verificar a resposta da API
    
    if (!data || !data.items) {
      console.error('Formato de resposta inválido:', data);
      return [];
    }
    
    // Log para debug da estrutura recebida
    console.log('Estrutura completa recebida:', data.items[0]);

    data.items.forEach(item => {
      console.log('Estrutura completa do item:', item); // Log para verificar a estrutura completa de cada item
    });

    return data.items.map(item => {
      console.log('Estrutura do item:', item); // Log para verificar a estrutura do objeto item
      console.log('Estrutura do item com contact_id:', item.contact_id); // Log para verificar se contact_id está presente
      // Extrair dados do item
      const chatData = item.chat || item;
      const channelData = item.channel || {};
      const messageData = item.lastMessage || {};
      
      // IDs necessários
      const channelId = item.channelId || channelData.id || chatData.channelId;
      const contactId = item.contact_id || chatData.contact_id; // Usando contact_id conforme nomenclatura do backend
      
      // Log detalhado para debug
      console.log('Processando chat:', {
        item,
        channelId,
        contactId
      });

      return {
        id: chatData.id,
        name: chatData.name || `Chat #${chatData.id}`,
        channelId,
        contactId,
        lastMessage: messageData.content || 'Sem mensagens',
        time: messageData.timestamp
          ? new Date(messageData.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : '',
        unread: parseInt(chatData.unreadCount || '0'),
        avatar: chatData.avatar,
        isGroup: chatData.isGroup || false,
        isMuted: chatData.isMuted || false,
        isPinned: chatData.isPinned || false,
        channelType: channelData.type || chatData.channelType,
        status: (messageData.status || 'pending').toLowerCase()
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
            ? { ...chat, status: 'closed' }
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todas');
  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!message.trim()) {
      console.log('Mensagem vazia');
      return;
    }
    
    if (!selectedChat) {
      console.log('Nenhum chat selecionado');
      return;
    }

    try {
      const lastMessage = selectedChat.lastMessage;
      console.log('Estrutura da última mensagem:', lastMessage); // Log para verificar a estrutura do objeto lastMessage
      const contactId = lastMessage ? lastMessage.contact_id : null; // Extraindo contact_id da última mensagem

      if (!contactId) {
        console.error('contact_id não encontrado na última mensagem');
        return;
      }

      const payload = {
        content: message.trim(),
        contentType: 'TEXT',
        chatId: selectedChat.id,
        contact_id: contactId // Usando contact_id da última mensagem
      };

      console.log('Enviando mensagem:', payload);

      const response = await chatMessagesService.sendMessage(payload);
      
      // Atualiza a lista de mensagens
      setChatMessages(prev => [...prev, response.data]);
      
      // Limpa o campo de mensagem
      setMessage('');
      
      // Atualiza o último status do chat
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id 
            ? { 
                ...chat, 
                lastMessage: message,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            : chat
        )
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const [chats, setChats] = useState([
    {
      id: 1,
      name: 'AGILE Atendimento',
      lastMessage: '✓ joia',
      time: '18:27',
      unread: 0,
      avatar: null,
      status: 'open',
    },
    {
      id: 2,
      name: '+55 51 9795-7349',
      lastMessage: 'Bom dia, Wanderley! Tudo bem? Aqui é o Rodrigo...',
      time: '12:41',
      unread: 0,
      avatar: null,
    },
    {
      id: 3,
      name: '+55 11 95497-6912',
      lastMessage: 'SISTEMA VERI.pdf',
      time: '09:20',
      unread: 0,
      avatar: null,
    },
    {
      id: 4,
      name: 'Itaú',
      lastMessage: 'Olá! Identificamos uma compra negada no seu c...',
      time: '01:22',
      unread: 0,
      avatar: null,
    },
    {
      id: 5,
      name: '+55 69 9314-8711',
      lastMessage: 'Ligação de voz perdida',
      time: 'Ontem',
      unread: 0,
      avatar: null,
    },
  ]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
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
      setChatMessages(messages);
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
        
        <SearchBar>
          <SearchInput elevation={0}>
            <IconButton size="small">
              <SearchIcon />
            </IconButton>
            <InputBase
              fullWidth
              placeholder="Pesquisar ou começar uma nova conversa"
              value={searchTerm}
              onChange={handleSearch}
            />
            <IconButton size="small">
              <FilterIcon />
            </IconButton>
          </SearchInput>
        </SearchBar>

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
          {chats.map((chat) => (
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
          ))}
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

            <Box sx={{ flex: 1, overflow: 'auto', padding: 2 }}>
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
                  <Typography>Carregando mensagens...</Typography>
                </Box>
              ) : (
                [...chatMessages].reverse().map((msg) => {
                  const isOutbound = msg.direction === 'OUTBOUND';
                  const isFile = msg.contentType === 'FILE';
                  const isImage = isFile && msg.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                  const isPdf = isFile && msg.fileUrl?.endsWith('.pdf');
                  
                  return (
                    <Box
                      key={msg.id}
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
                          minWidth: isFile ? '250px' : 'auto',
                        }}
                      >
                        {msg.isDocument ? (
                          <DocumentPreview 
                            document={{
                              filename: msg.document?.filename || 'Documento',
                              url: msg.document?.url || msg.fileUrl,
                              type: msg.document?.type || (isPdf ? 'pdf' : isImage ? 'image' : 'document')
                            }} 
                          />
                        ) : isFile ? (
                          <DocumentPreview 
                            document={{
                              filename: msg.content.split('\n')[0] || 'Arquivo',
                              url: msg.fileUrl,
                              type: isPdf ? 'pdf' : isImage ? 'image' : 'document'
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
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#667781', 
                            display: 'block', 
                            textAlign: 'right',
                            mt: 0.5
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>

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
                onChange={(e) => setMessage(e.target.value)}
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
          </Box>
        )}
      </ChatMainArea>
    </ChatContainer>
  );
};

export default WhatsAppStyleChat;
