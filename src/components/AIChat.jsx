import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Paper, 
  Avatar,
  CircularProgress 
} from '@mui/material';
import { 
  Send as SendIcon, 
  RocketLaunch as AIIcon,
  Close as CloseIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import axios from 'axios';
import { getUserData } from '../utils/auth'; // Importar método correto
import { authService } from '../services/authService'; // Importar serviço de autenticação
import chatMessagesService from '../services/chatMessagesService';

// Função para obter dados do usuário diretamente do localStorage
const getUserDataFromStorage = () => {
  try {
    // Primeiro, tentar obter do serviço de autenticação
    const currentUser = authService.getCurrentUser();
    
    if (currentUser) {
      return {
        id: currentUser.id || 'unknown',
        username: currentUser.name || currentUser.username || 'Usuário',
        email: currentUser.email
      };
    }

    // Fallback para o método do auth.js
    const userData = getUserData(); 
    
    if (userData) {
      return {
        id: userData.id || 'unknown',
        username: userData.name || userData.username || 'Usuário',
        email: userData.email
      };
    }
  } catch (error) {
    console.error('Erro ao recuperar dados do usuário:', error);
  }
  
  return { 
    id: 'unknown', 
    username: 'Usuário' 
  };
};

// Função para gerar ID único
const generateUniqueId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
};

const ChatContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 100,  // Posicionar logo acima do botão de IA (24 + altura do chat)
  right: 24,    // Alinhado com o botão
  width: '380px',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
  overflow: 'hidden',
  zIndex: 1300,  // Garantir que fique acima de outros elementos
  backgroundColor: theme.palette.background.paper,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const ChatInputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const MessageBubble = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'variant',
})(({ theme, variant }) => ({
  alignSelf: variant === 'user' ? 'flex-end' : 'flex-start',
  backgroundColor: variant === 'user' 
    ? theme.palette.primary.main 
    : theme.palette.grey[300],
  color: variant === 'user' 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  maxWidth: '70%',
  wordBreak: 'break-word',
  marginBottom: theme.spacing(1),
}));

const AIChat = ({ onClose }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([
    { 
      id: 0, 
      text: 'Olá! Sou seu assistente financeiro de IA. Como posso ajudar você hoje?', 
      variant: 'ai' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Usar função personalizada para buscar dados do usuário
  const userData = getUserDataFromStorage();

  // Rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Buscar histórico de mensagens quando um contato é selecionado
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const chatHistory = await chatMessagesService.getChatMessages();
        setMessages(chatHistory);
      } catch (error) {
        console.error('Erro ao buscar histórico de chat:', error);
      }
    };

    fetchChatHistory();
  }, []);

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    try {
      setIsLoading(true);

      // Preparar dados da mensagem
      const messageData = {
        content: inputMessage,
        sender_id: userData.id,
        receiver_id: 'ai'
      };

      // Enviar mensagem
      const sentMessage = await chatMessagesService.sendMessage(messageData);

      // Atualizar estado das mensagens
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      
      // Limpar input
      setInputMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Opcional: mostrar mensagem de erro para o usuário
    } finally {
      setIsLoading(false);
    }
  };

  // Permitir envio com Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Função para limpar o histórico de mensagens
  const handleClearChat = () => {
    setMessages([
      { 
        id: 0, 
        text: 'Olá! Sou seu assistente financeiro de IA. Como posso ajudar você hoje?', 
        variant: 'ai' 
      }
    ]);
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <ChatContainer elevation={6}>
      <ChatHeader>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}>
            <AIIcon />
          </Avatar>
          <Typography variant="h6">Assistente Financeiro</Typography>
          <Typography variant="caption">
            {userData.username || 'Usuário'}
          </Typography>
        </Box>
        <Box>
          <IconButton 
            onClick={handleClearChat} 
            color="inherit" 
            size="small" 
            sx={{ mr: 1 }}
            title="Limpar chat"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={onClose} 
            color="inherit" 
            size="small"
            title="Fechar chat"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </ChatHeader>

      <ChatMessages>
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            variant={msg.variant}
          >
            {msg.isLoading ? <CircularProgress size={20} /> : msg.text}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInputContainer>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Digite sua pergunta..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          sx={{ mr: 1 }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default AIChat;
