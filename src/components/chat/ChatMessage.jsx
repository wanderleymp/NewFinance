import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Avatar,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  GetApp as DownloadIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Visibility as VisibilityIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import DocumentPreview from './DocumentPreview';

// Função auxiliar para extrair URLs de texto
const extractUrl = (text) => {
  if (!text || typeof text !== 'string') return null;
  
  // Regex para detectar URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  
  return matches ? matches[0] : null;
};

// Função auxiliar para determinar o tipo de arquivo a partir da URL ou nome
const getFileType = (url) => {
  if (!url) return null;
  
  try {
    // Extrair a extensão do arquivo
    const extension = url.split('.').pop().toLowerCase().split('?')[0];
    
    // Mapeamento de extensões para tipos de arquivo
    const fileTypeMap = {
      // Documentos
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'doc',
      'txt': 'text',
      'rtf': 'doc',
      
      // Planilhas
      'xls': 'excel',
      'xlsx': 'excel',
      'csv': 'excel',
      
      // Imagens
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'bmp': 'image',
      'webp': 'image',
      'svg': 'image',
      
      // Áudio
      'mp3': 'audio',
      'wav': 'audio',
      'ogg': 'audio',
      'aac': 'audio',
      
      // Vídeo
      'mp4': 'video',
      'mov': 'video',
      'avi': 'video',
      'webm': 'video',
      'mkv': 'video',
      
      // Arquivos compactados
      'zip': 'archive',
      'rar': 'archive',
      '7z': 'archive',
      'tar': 'archive',
      'gz': 'archive'
    };
    
    return fileTypeMap[extension] || 'file';
  } catch (error) {
    console.error('Erro ao determinar tipo de arquivo:', error);
    return 'file';
  }
};

// Função para verificar se a mensagem contém um documento
const isDocumentMessage = (message) => {
  if (!message) return false;
  
  // Log detalhado para depuração
  console.log('Verificando se é documento:', message);
  
  // Verificar propriedades específicas de documento
  if (
    message.isDocument || 
    message.isFile || 
    message.type === 'document' || 
    message.type === 'file' ||
    message.contentType === 'DOCUMENT' ||
    message.contentType === 'FILE' ||
    message.contentType === 'IMAGE' ||
    message.contentType === 'AUDIO' ||
    message.contentType === 'VIDEO' ||
    (message.document && (message.document.url || message.document.path)) ||
    (message.file && (message.file.url || message.file.path)) ||
    (message.media && (message.media.url || message.media.path))
  ) {
    console.log('Detectado como documento por propriedades específicas');
    return true;
  }
  
  // Verificar se o conteúdo contém uma URL
  const url = extractUrl(message.content);
  if (url) {
    // Verificar se a URL termina com uma extensão de arquivo conhecida
    const fileType = getFileType(url);
    if (fileType && fileType !== 'file') {
      console.log('Detectado como documento por URL no conteúdo:', url, 'tipo:', fileType);
      return true;
    }
  }
  
  // Verificar se há URLs em outras propriedades
  if (message.url || message.fileUrl || message.mediaUrl || message.documentUrl) {
    console.log('Detectado como documento por URL em propriedades alternativas');
    return true;
  }
  
  return false;
};

// Função para extrair dados do documento
const extractDocumentData = (message) => {
  try {
    // Se temos um objeto document explícito
    if (message.document) {
      return {
        url: message.document.url || message.document.path || '',
        filename: message.document.filename || message.document.name || 'documento',
        type: message.document.type || getFileType(message.document.url || message.document.path)
      };
    }
    
    // Se temos um objeto file explícito
    if (message.file) {
      return {
        url: message.file.url || message.file.path || '',
        filename: message.file.filename || message.file.name || 'arquivo',
        type: message.file.type || getFileType(message.file.url || message.file.path)
      };
    }
    
    // Se temos um objeto media explícito
    if (message.media) {
      return {
        url: message.media.url || message.media.path || '',
        filename: message.media.filename || message.media.name || 'mídia',
        type: message.media.type || getFileType(message.media.url || message.media.path)
      };
    }
    
    // Se temos uma URL no conteúdo
    const url = extractUrl(message.content);
    if (url) {
      // Extrair o nome do arquivo da URL
      const filename = url.split('/').pop().split('?')[0] || 'arquivo';
      return {
        url: url,
        filename: filename,
        type: getFileType(url)
      };
    }
    
    // Verificar outras propriedades que possam conter URLs
    const documentUrl = message.url || message.fileUrl || message.mediaUrl || message.documentUrl || message.content || '';
    
    // Fallback para outros casos
    return {
      url: documentUrl,
      filename: message.filename || message.name || documentUrl.split('/').pop().split('?')[0] || 'documento',
      type: message.type || message.contentType?.toLowerCase() || getFileType(documentUrl) || 'file'
    };
  } catch (error) {
    console.error('Erro ao extrair dados do documento:', error);
    return {
      url: message.content || '',
      filename: 'documento',
      type: 'file'
    };
  }
};

// Componentes estilizados
const MessagePaper = styled(Paper)(({ theme, isOwn }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(1),
  marginLeft: isOwn ? 'auto' : 0,
  marginRight: isOwn ? 0 : 'auto',
  backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.background.paper,
  color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
  position: 'relative',
  '&:hover .message-actions': {
    opacity: 1,
  },
}));

const MessageActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: -20,
  display: 'flex',
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: 'opacity 0.2s ease',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  boxShadow: theme.shadows[2],
}));

const AudioPlayer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  width: '100%',
}));

const AudioProgress = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  height: 4,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 2,
  cursor: 'pointer',
  position: 'relative',
}));

const AudioProgressBar = styled(Box)(({ theme, progress }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  height: '100%',
  width: `${progress}%`,
  backgroundColor: theme.palette.primary.main,
  borderRadius: 2,
}));

const ChatMessage = ({ message, isOwn, isown, onReply, onForward, onDelete, onStar }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isStarred, setIsStarred] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const audioRef = React.useRef(null);

  // Prioriza isown se ambos forem passados
  const messageIsOwn = isown !== undefined ? isown : isOwn;
  
  // Verificar se a mensagem contém um documento
  useEffect(() => {
    try {
      console.log('Analisando mensagem para detecção de documento:', message);
      
      if (isDocumentMessage(message)) {
        const docData = extractDocumentData(message);
        console.log('Documento detectado, dados extraídos:', docData);
        
        setShowDocument(true);
        setDocumentData(docData);
      } else {
        console.log('Não é um documento');
        setShowDocument(false);
        setDocumentData(null);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem para detecção de documento:', error);
      setShowDocument(false);
      setDocumentData(null);
    }
  }, [message]);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleReply = () => {
    onReply?.();
    handleMenuClose();
  };

  const handleForward = () => {
    onForward?.();
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.();
    handleMenuClose();
  };

  const handleStar = () => {
    setIsStarred(!isStarred);
    onStar?.();
    handleMenuClose();
  };

  const handleAudioPlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderContent = () => {
    try {
      // Se for um documento detectado
      if (showDocument && documentData) {
        console.log('Renderizando documento:', documentData);
        return <DocumentPreview document={documentData} />;
      }
      
      // Verificar o tipo de mensagem explícito
      const messageType = message.type?.toLowerCase() || message.contentType?.toLowerCase();
      
      switch (messageType) {
        case 'text':
          return <Typography variant="body1">{message.content}</Typography>;
          
        case 'image':
          return (
            <Box
              component="img"
              src={message.content || message.url}
              alt={message.fileName || 'Imagem'}
              sx={{
                maxWidth: '100%',
                maxHeight: 200,
                borderRadius: 1,
                cursor: 'pointer',
              }}
              onClick={() => window.open(message.content || message.url, '_blank')}
            />
          );
          
        case 'audio':
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={handleAudioPlayPause}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  height: 4, 
                  bgcolor: 'grey.300', 
                  borderRadius: 1, 
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = (x / rect.width) * 100;
                  setAudioProgress(percentage);
                  if (audioRef.current) {
                    audioRef.current.currentTime = (percentage / 100) * audioRef.current.duration;
                  }
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    height: '100%', 
                    width: `${audioProgress}%`, 
                    bgcolor: 'primary.main', 
                    borderRadius: 1 
                  }} 
                />
              </Box>
              <Typography variant="caption">
                {audioRef.current 
                  ? `${Math.floor(audioRef.current.currentTime / 60)}:${Math.floor(audioRef.current.currentTime % 60).toString().padStart(2, '0')}`
                  : '0:00'
                }
              </Typography>
              <audio
                ref={audioRef}
                src={message.content || message.url}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                  }
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setAudioProgress(0);
                }}
              />
            </Box>
          );
          
        case 'file':
        case 'document':
          // Este caso só será atingido se a detecção de documento falhar
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileIcon color="primary" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">{message.fileName || 'Arquivo'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {message.fileSize || ''} {message.fileType ? `• ${message.fileType}` : ''}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                component="a" 
                href={message.content || message.url} 
                download
                target="_blank"
              >
                <DownloadIcon />
              </IconButton>
            </Box>
          );
          
        default:
          // Mensagem de texto padrão
          return <Typography variant="body1">{message.content}</Typography>;
      }
    } catch (error) {
      console.error('Erro ao renderizar conteúdo da mensagem:', error);
      return <Typography variant="body1" color="error">Erro ao exibir mensagem</Typography>;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: messageIsOwn ? 'flex-end' : 'flex-start',
        mb: 2,
        position: 'relative',
      }}
    >
      {!messageIsOwn && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            bgcolor: 'primary.main',
          }}
        >
          {message.sender?.charAt(0) || 'U'}
        </Avatar>
      )}
      <MessagePaper isOwn={messageIsOwn} elevation={1}>
        <MessageActions className="message-actions">
          <IconButton size="small" onClick={handleReply}>
            <ReplyIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleForward}>
            <ForwardIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleStar}>
            {isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </MessageActions>

        {renderContent()}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {message.status === 'error' && (
              <span style={{ color: 'red', marginLeft: '5px' }}>⚠️</span>
            )}
            {message.status === 'sending' && (
              <span style={{ marginLeft: '5px' }}>⏳</span>
            )}
            {message.status === 'sent' && (
              <span style={{ marginLeft: '5px' }}>✓</span>
            )}
            {message.status === 'delivered' && (
              <span style={{ marginLeft: '5px' }}>✓✓</span>
            )}
            {message.status === 'read' && (
              <span style={{ color: 'blue', marginLeft: '5px' }}>✓✓</span>
            )}
          </Typography>
        </Box>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleReply}>
            <ReplyIcon sx={{ mr: 1 }} /> Responder
          </MenuItem>
          <MenuItem onClick={handleForward}>
            <ForwardIcon sx={{ mr: 1 }} /> Encaminhar
          </MenuItem>
          <MenuItem onClick={handleStar}>
            {isStarred ? <StarIcon sx={{ mr: 1 }} /> : <StarBorderIcon sx={{ mr: 1 }} />}
            {isStarred ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} /> Apagar
          </MenuItem>
        </Menu>
      </MessagePaper>
    </Box>
  );
};

export default ChatMessage;
