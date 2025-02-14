import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Paper,
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
} from '@mui/icons-material';

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
  width: '200px',
}));

const AudioProgress = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  height: 4,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  borderRadius: 2,
  position: 'relative',
  cursor: 'pointer',
}));

const AudioProgressBar = styled(Box)(({ theme, progress = 0 }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  height: '100%',
  width: `${progress}%`,
  backgroundColor: theme.palette.primary.main,
  borderRadius: 2,
}));

const ChatMessage = ({ message, isOwn, onReply, onForward, onDelete, onStar }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isStarred, setIsStarred] = useState(false);
  const audioRef = React.useRef(null);

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
    switch (message.type) {
      case 'text':
        return (
          <Typography variant="body1">{message.content}</Typography>
        );
      case 'image':
        return (
          <Box
            component="img"
            src={message.content}
            alt={message.fileName}
            sx={{
              maxWidth: '100%',
              maxHeight: 200,
              borderRadius: 1,
              cursor: 'pointer',
            }}
          />
        );
      case 'audio':
        return (
          <AudioPlayer>
            <IconButton size="small" onClick={handleAudioPlayPause}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <AudioProgress onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = (x / rect.width) * 100;
              setAudioProgress(percentage);
              if (audioRef.current) {
                audioRef.current.currentTime = (percentage / 100) * audioRef.current.duration;
              }
            }}>
              <AudioProgressBar progress={audioProgress} />
            </AudioProgress>
            <Typography variant="caption">{message.duration}</Typography>
            <audio
              ref={audioRef}
              src={message.content}
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
          </AudioPlayer>
        );
      case 'file':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2">{message.fileName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {message.fileSize} • {message.fileType}
              </Typography>
            </Box>
            <IconButton size="small" component="a" href={message.content} download={message.fileName}>
              <DownloadIcon />
            </IconButton>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <MessagePaper isOwn={isOwn} elevation={1}>
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
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  );
};

export default ChatMessage;
