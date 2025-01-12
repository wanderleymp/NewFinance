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
import { getUserData } from '../utils/auth';

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

const ChatMessages = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
});

const MessageBubble = styled(Box)(({ theme, variant }) => ({
  maxWidth: '80%',
  padding: '10px 15px',
  borderRadius: '12px',
  marginBottom: '10px',
  alignSelf: variant === 'user' ? 'flex-end' : 'flex-start',
  backgroundColor: variant === 'user' 
    ? theme.palette.primary.light 
    : theme.palette.grey[200],
  color: variant === 'user' 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
}));

const ChatInputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const AIChat = ({ onClose }) => {
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

  const userData = getUserData();

  // Configuração de WebSocket para receber respostas
  useEffect(() => {
    // Criando um canal de comunicação único para este usuário
    const channelId = `ai-chat-${userData?.id || 'anonymous'}`;
    
    const eventSource = new EventSource(`https://n8n.webhook.agilefinance.com.br/sse/${channelId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Verificar se a mensagem é para este chat
        if (data.requestId === window.lastAIRequestId) {
          const aiResponse = { 
            id: messages.length + 1, 
            text: data.response, 
            variant: 'ai' 
          };

          setMessages(prev => {
            // Remover mensagem de carregamento
            const filteredMessages = prev.filter(msg => !msg.isLoading);
            return [...filteredMessages, aiResponse];
          });
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao processar resposta da IA:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Erro no EventSource:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [messages.length, userData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const requestId = generateUniqueId(); // ID único para rastrear a conversa
    window.lastAIRequestId = requestId; // Armazenar globalmente para referência

    const userMessage = { 
      id: messages.length, 
      text: inputMessage, 
      variant: 'user' 
    };

    const aiLoadingMessage = { 
      id: messages.length + 1, 
      text: 'Processando...',
      variant: 'ai',
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, aiLoadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Criando um canal de comunicação único para este usuário
      const channelId = `ai-chat-${userData?.id || 'anonymous'}`;

      await axios.post('https://n8n.webhook.agilefinance.com.br/webhook/ia/chat', {
        message: inputMessage,
        user_id: userData?.id || 'unknown',
        username: userData?.username || 'Usuário',
        requestId: requestId,
        channelId: channelId
      });

    } catch (error) {
      console.error('Erro na comunicação com o assistente de IA:', error);
      
      // Remover a mensagem de carregamento
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      const errorMessage = { 
        id: messages.length + 2, 
        text: 'Ops! Houve um problema ao processar sua solicitação.',
        variant: 'ai' 
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer elevation={6}>
      <ChatHeader>
        <Avatar sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}>
          <AIIcon />
        </Avatar>
        <Box>
          <Typography variant="h6">Assistente Financeiro</Typography>
          <Typography variant="caption">IA em tempo real</Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ ml: 'auto', color: 'white' }}
        >
          ✕
        </IconButton>
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
