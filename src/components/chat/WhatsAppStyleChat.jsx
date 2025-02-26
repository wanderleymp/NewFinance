import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DocumentPreview from './DocumentPreview';
import chatMessagesService from '../../services/chatMessagesService';
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

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    try {
      if (!message.trim() || !selectedChat) {
        return;
      }

      // Obter o contactId do chat selecionado
      const contactId = selectedChat.contactId || selectedChat.lastContactId;
      
      if (!contactId) {
        console.error('Erro: Não foi possível obter o contactId para envio da mensagem');
        return;
      }
      
      console.log('Dados do chat para envio de mensagem:', {
        chatId: selectedChat.id,
        contactId: contactId,
        channelId: selectedChat.channelId,
        channelType: selectedChat.channelType
      });

      const payload = {
        content: message.trim(),
        contentType: 'TEXT',
        contactId: contactId,
        channelId: selectedChat.channelId || 6
      };

      console.log('Enviando mensagem:', payload);

      // Usando o novo formato do método sendMessage
      const response = await chatMessagesService.sendMessage(selectedChat.id, payload);
      
      console.log('Resposta do envio de mensagem:', response);
      
      // Atualiza a lista de mensagens
      const newMessage = response.data || {
        id: Date.now(),
        content: message.trim(),
        contentType: 'TEXT',
        timestamp: new Date().toISOString(),
        sender: 'me',
        status: 'sent'
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      
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
      // Exibir mensagem de erro para o usuário
      setSnackbar({
        open: true,
        message: `Erro ao enviar mensagem: ${error.message || 'Erro desconhecido'}`,
        severity: 'error'
      });
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

            <Box sx={{ flex: 1, overflow: 'auto', padding: 2 }}>
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
                  
                  // Verificar tipos de mensagem
                  const isDocument = 
                    msg.isDocument || 
                    msg.contentType === 'DOCUMENT' || 
                    msg.type === 'document' || 
                    msg.type === 'DOCUMENT';
                  
                  const isFile = 
                    msg.isFile || 
                    msg.contentType === 'FILE' || 
                    msg.type === 'file' || 
                    msg.type === 'FILE' || 
                    !!msg.fileUrl;
                  
                  // Verificar se há URL no conteúdo da mensagem
                  let fileUrl = msg.fileUrl || msg.document?.url || '';
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
                    id: msg.id,
                    contentType: msg.contentType,
                    isDocument,
                    isFile,
                    hasFileUrl,
                    hasUrlInContent,
                    fileType,
                    fileUrl,
                    showAsDocument
                  });
                  
                  // Determinar nome do arquivo
                  let filename = msg.document?.filename;
                  if (!filename && fileUrl) {
                    const urlParts = fileUrl.split('/');
                    filename = urlParts[urlParts.length - 1];
                  }
                  
                  return (
                    <Box
                      key={msg.id || index} // Usar índice como fallback para evitar warning de key
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
