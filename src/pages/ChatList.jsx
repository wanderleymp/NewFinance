import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  InputBase,
  Paper,
  alpha,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Circle as CircleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import ChatLayout from '../layouts/ChatLayout';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';

// Componente estilizado para os itens do chat
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

const ChatItem = ({ children, ...props }) => (
  <StyledPaper elevation={1} {...props}>
    {children}
  </StyledPaper>
);

const ChatList = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);


  // Dados mockados para exemplo
  const chats = [
    {
      id: 1,
      name: 'João Silva',
      avatar: 'JS',
      lastMessage: 'Olá, tudo bem?',
      timestamp: '10:30',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Maria Oliveira',
      avatar: 'MO',
      lastMessage: 'Vou enviar os arquivos hoje',
      timestamp: '09:15',
      unread: 0,
      online: false,
    },
    // Adicione mais chats conforme necessário
  ];

  // Rolar para a última mensagem quando uma nova for adicionada
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        {/* Sidebar com lista de chats */}
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
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">Conversas</Typography>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Barra de pesquisa */}
          <Box sx={{ p: 2 }}>
            <Paper
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'action.hover',
              }}
            >
              <IconButton sx={{ p: '10px' }}>
                <SearchIcon />
              </IconButton>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Pesquisar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Paper>
          </Box>

          {/* Lista de chats */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {chats
              .filter(chat => 
                chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((chat) => (
                <ChatItem
                  key={chat.id}
                  elevation={selectedChat?.id === chat.id ? 3 : 1}
                  onClick={() => setSelectedChat(chat)}
                  sx={{
                    bgcolor: selectedChat?.id === chat.id ? 'primary.light' : 'background.paper',
                    color: selectedChat?.id === chat.id ? 'primary.contrastText' : 'text.primary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      bgcolor: selectedChat?.id === chat.id ? 'primary.light' : 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{chat.avatar}</Avatar>
                      {chat.online && (
                        <CircleIcon
                          sx={{
                            position: 'absolute',
                            right: -2,
                            bottom: -2,
                            color: 'success.main',
                            fontSize: 12,
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">{chat.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {chat.timestamp}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {chat.lastMessage}
                        </Typography>
                        {chat.unread > 0 && (
                          <Box
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              borderRadius: '50%',
                              width: 20,
                              height: 20,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                            }}
                          >
                            {chat.unread}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </ChatItem>
              ))}
          </Box>
        </Box>

        {/* Área de mensagens */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 1,
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
                  <Box sx={{ position: 'relative' }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedChat.avatar}</Avatar>
                    {selectedChat.online && (
                      <CircleIcon
                        sx={{
                          position: 'absolute',
                          right: -2,
                          bottom: -2,
                          color: 'success.main',
                          fontSize: 12,
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1">{selectedChat.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedChat.online ? 'Online' : 'Última vez hoje às 18:30'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
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
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    isOwn={message.senderId === 'currentUser'}
                    onReply={() => {}}
                    onForward={() => {}}
                    onDelete={() => setMessages(prev => prev.filter((_, i) => i !== index))}
                    onStar={() => {}}
                  />
                ))}
                {isTyping && (
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Digitando...
                    </Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input de mensagem */}
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <ChatInput
                  onSendMessage={(text) => {
                    const newMessage = {
                      type: 'text',
                      content: text,
                      timestamp: new Date().toISOString(),
                      senderId: 'currentUser',
                    };
                    setMessages(prev => [...prev, newMessage]);
                  }}
                  onSendFile={async (file) => {
                    // Simular upload do arquivo
                    const fileUrl = URL.createObjectURL(file);
                    const newMessage = {
                      type: 'file',
                      content: fileUrl,
                      fileName: file.name,
                      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
                      fileType: file.type.split('/')[0],
                      timestamp: new Date().toISOString(),
                      senderId: 'currentUser',
                    };
                    setMessages(prev => [...prev, newMessage]);
                  }}
                  onSendImage={async (file) => {
                    // Simular upload da imagem
                    const imageUrl = URL.createObjectURL(file);
                    const newMessage = {
                      type: 'image',
                      content: imageUrl,
                      fileName: file.name,
                      timestamp: new Date().toISOString(),
                      senderId: 'currentUser',
                    };
                    setMessages(prev => [...prev, newMessage]);
                  }}
                  onSendAudio={async (blob) => {
                    // Simular upload do áudio
                    const audioUrl = URL.createObjectURL(blob);
                    const newMessage = {
                      type: 'audio',
                      content: audioUrl,
                      duration: '0:30',
                      timestamp: new Date().toISOString(),
                      senderId: 'currentUser',
                    };
                    setMessages(prev => [...prev, newMessage]);
                  }}
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
              <img
                src="/chat-placeholder.svg"
                alt="Selecione um chat"
                style={{ width: '200px', opacity: 0.5 }}
              />
              <Typography variant="h6" color="text.secondary">
                Selecione uma conversa para começar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Envie e receba mensagens, arquivos, fotos e muito mais
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ChatLayout>
  );
};

export default ChatList;
