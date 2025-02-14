import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  Typography,
  Popover,
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  InsertEmoticon as EmojiIcon,
  Description as DocumentIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  PhotoCamera as CameraIcon,
  LocationOn as LocationIcon,
  ContactPhone as ContactIcon,
} from '@mui/icons-material';

const ChatInput = ({ onSendMessage, onSendFile, onSendImage, onSendAudio }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attachMenuAnchor, setAttachMenuAnchor] = useState(null);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onSendAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Iniciar timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        await onSendFile(file);
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
      }
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        await onSendImage(file);
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
      }
      setLoading(false);
      event.target.value = '';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Notificar quando está digitando
  useEffect(() => {
    if (message) {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message]);

  const handleEmojiClick = (event) => {
    setEmojiPickerAnchor(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiPickerAnchor(null);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    handleEmojiClose();
  };

  const handleAttachClick = (event) => {
    setAttachMenuAnchor(event.currentTarget);
  };

  const handleAttachClose = () => {
    setAttachMenuAnchor(null);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Paper
        elevation={3}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: 2,
        }}
      >
        <Tooltip title="Emojis">
          <IconButton
            color="primary"
            onClick={handleEmojiClick}
            disabled={loading || isRecording}
          >
            <EmojiIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Anexar">
          <IconButton
            color="primary"
            onClick={handleAttachClick}
            disabled={loading || isRecording}
          >
            <AttachFileIcon />
          </IconButton>
        </Tooltip>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          multiple={false}
        />
        <input
          type="file"
          ref={imageInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleImageSelect}
          multiple={false}
        />

        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <InputBase
            fullWidth
            multiline
            maxRows={4}
            placeholder={isRecording ? `Gravando... ${formatTime(recordingTime)}` : "Digite sua mensagem..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isRecording}
            sx={{ pl: 1, pr: 1 }}
          />
          {loading && (
            <CircularProgress
              size={20}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          )}
        </Box>

        {message.trim() ? (
          <Tooltip title="Enviar mensagem">
            <IconButton color="primary" onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={isRecording ? "Parar gravação" : "Gravar áudio"}>
            <IconButton
              color={isRecording ? "error" : "primary"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Paper>

      <Menu
        anchorEl={attachMenuAnchor}
        open={Boolean(attachMenuAnchor)}
        onClose={handleAttachClose}
      >
        <MenuItem onClick={() => {
          imageInputRef.current?.click();
          handleAttachClose();
        }}>
          <ImageIcon sx={{ mr: 1 }} /> Foto ou Vídeo
        </MenuItem>
        <MenuItem onClick={() => {
          fileInputRef.current?.click();
          handleAttachClose();
        }}>
          <DocumentIcon sx={{ mr: 1 }} /> Documento
        </MenuItem>
        <MenuItem onClick={handleAttachClose}>
          <CameraIcon sx={{ mr: 1 }} /> Câmera
        </MenuItem>
        <MenuItem onClick={handleAttachClose}>
          <ContactIcon sx={{ mr: 1 }} /> Contato
        </MenuItem>
        <MenuItem onClick={handleAttachClose}>
          <LocationIcon sx={{ mr: 1 }} /> Localização
        </MenuItem>
      </Menu>

      <Popover
        open={Boolean(emojiPickerAnchor)}
        anchorEl={emojiPickerAnchor}
        onClose={handleEmojiClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1 }}>
            {["😀", "😁", "😂", "😃", "😄", "😅", "😆", "😇",
              "😈", "😉", "😊", "😋", "😌", "😍", "😎", "😏"].map((emoji) => (
              <IconButton
                key={emoji}
                size="small"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default ChatInput;
