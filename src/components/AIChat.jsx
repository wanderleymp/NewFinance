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
  RocketLaunch as AIIcon 
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import axios from 'axios';
import { getUserData } from '../utils/auth'; // Importar método correto
import { authService } from '../services/api'; // Importar serviço de autenticação

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
  bottom: 90,
  right: 24,
  width: '380px',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    console.log('Dados do usuário:', userData);
    console.log('Mensagem a ser enviada:', inputMessage);

    const requestId = generateUniqueId(); // ID único para rastrear a conversa

    const userMessage = { 
      id: `user_${messages.length}`, // Prefixo único para mensagens do usuário
      text: inputMessage, 
      variant: 'user' 
    };

    const aiLoadingMessage = { 
      id: `loading_${messages.length}`, // Prefixo único para mensagem de carregamento
      text: 'Processando...',
      variant: 'ai',
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, aiLoadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Iniciando requisição para o n8n');
      
      const response = await axios.post('https://n8n.webhook.agilefinance.com.br/webhook/ia/chat', 
        {
          mensage: inputMessage,
          user_id: userData.id,
          username: userData.username,
          requestId: requestId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'ffcaa89a3e19bd98e911475c7974309b'
          },
          // Adicionar timeout para evitar espera infinita
          timeout: 10000
        }
      );

      console.log('Resposta completa do n8n:', response);
      console.log('Dados da resposta:', response.data);

      // Remover a mensagem de carregamento
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      // Adicionar resposta da IA
      const aiResponse = { 
        id: `ai_${messages.length + 1}`, // Prefixo único para mensagens da IA
        text: response.data?.output || response.data?.response || 'Desculpe, não consegui processar sua solicitação.',
        variant: 'ai' 
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);

    } catch (error) {
      console.error('Erro COMPLETO na comunicação com o assistente de IA:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // Remover a mensagem de carregamento
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      const errorMessage = { 
        id: `error_${messages.length + 1}`, // Prefixo único para mensagens de erro
        text: error.response?.data?.message || 'Ops! Houve um problema ao processar sua solicitação.',
        variant: 'ai' 
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <ChatContainer elevation={6}>
      <ChatHeader>
        <Avatar sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}>
          <AIIcon />
        </Avatar>
        <Box>
          <Typography variant="h6">Assistente Financeiro</Typography>
          <Typography variant="caption">
            {userData.username || 'Usuário'}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="error" 
            onClick={handleLogout}
            title="Sair"
            sx={{ mr: 1 }}
          >
            ⏻
          </IconButton>
          <IconButton 
            onClick={onClose} 
            sx={{ color: 'white' }}
          >
            ✕
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
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
          sx={{ mr: 1 }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          <SendIcon />
        </IconButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default AIChat;
