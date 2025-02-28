import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tooltip,
  Modal,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

// Função para obter a extensão do arquivo a partir do nome ou URL
const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

// Função para determinar o tipo de arquivo baseado na extensão
const getFileTypeFromExtension = (extension) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const pdfExtensions = ['pdf'];
  const docExtensions = ['doc', 'docx', 'txt', 'rtf'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'webm'];
  
  if (imageExtensions.includes(extension)) return 'image';
  if (pdfExtensions.includes(extension)) return 'pdf';
  if (docExtensions.includes(extension)) return 'doc';
  if (audioExtensions.includes(extension)) return 'audio';
  if (videoExtensions.includes(extension)) return 'video';
  
  return 'file';
};

// Componente estilizado para o modal
const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Componente para o conteúdo do modal
const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative',
}));

// Componente para o ícone de documento
const DocumentIcon = ({ fileType }) => {
  switch (fileType) {
    case 'pdf':
      return <PdfIcon sx={{ fontSize: 40, color: '#e94335' }} />;
    case 'image':
      return <ImageIcon sx={{ fontSize: 40, color: '#34a853' }} />;
    case 'doc':
      return <DocIcon sx={{ fontSize: 40, color: '#4285f4' }} />;
    case 'audio':
      return <AudioIcon sx={{ fontSize: 40, color: '#fbbc05' }} />;
    case 'video':
      return <VideoIcon sx={{ fontSize: 40, color: '#ea4335' }} />;
    default:
      return <FileIcon sx={{ fontSize: 40, color: '#9e9e9e' }} />;
  }
};

const DocumentPreview = ({ document }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileType, setFileType] = useState('file');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  
  useEffect(() => {
    if (document) {
      console.log('Documento recebido:', document);
      
      // Extrair URL do documento
      const url = document.url || document.path || document.content || '';
      setFileUrl(url);
      
      // Extrair nome do arquivo
      const name = document.filename || document.name || url.split('/').pop().split('?')[0] || 'documento';
      setFileName(name);
      
      // Determinar tipo de arquivo
      const extension = getFileExtension(name);
      const type = document.type || getFileTypeFromExtension(extension);
      setFileType(type);
      
      console.log('Dados do documento processados:', { url, name, type });
    }
  }, [document]);
  
  // Abrir o modal de visualização
  const handleOpenModal = () => {
    setModalOpen(true);
    setLoading(true);
  };
  
  // Fechar o modal de visualização
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  // Callback quando o conteúdo é carregado
  const handleContentLoad = () => {
    setLoading(false);
  };
  
  // Função para baixar o arquivo
  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };
  
  // Renderizar o conteúdo do modal baseado no tipo de arquivo
  const renderModalContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <Box sx={{ maxWidth: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            <img 
              src={fileUrl} 
              alt={fileName} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              onLoad={handleContentLoad}
            />
          </Box>
        );
      case 'pdf':
        return (
          <Box sx={{ width: '100%', height: '80vh' }}>
            <iframe 
              src={fileUrl} 
              title={fileName} 
              width="100%" 
              height="100%" 
              style={{ border: 'none' }} 
              onLoad={handleContentLoad}
            />
          </Box>
        );
      case 'audio':
        return (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <audio 
              controls 
              src={fileUrl} 
              style={{ width: '100%', maxWidth: '500px' }}
              onLoadedData={handleContentLoad}
            >
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </Box>
        );
      case 'video':
        return (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <video 
              controls 
              src={fileUrl} 
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
              onLoadedData={handleContentLoad}
            >
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </Box>
        );
      default:
        setLoading(false);
        return (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <DocumentIcon fileType={fileType} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              {fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Este tipo de arquivo não pode ser visualizado diretamente.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />} 
              component="a" 
              href={fileUrl} 
              download 
              target="_blank"
              sx={{ mt: 2 }}
            >
              Baixar Arquivo
            </Button>
          </Box>
        );
    }
  };
  
  if (!document) return null;
  
  return (
    <>
      <Card sx={{ maxWidth: 345, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <DocumentIcon fileType={fileType} />
          <Box sx={{ ml: 2, overflow: 'hidden' }}>
            <Typography variant="subtitle1" noWrap title={fileName}>
              {fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fileType.toUpperCase()}
            </Typography>
          </Box>
        </Box>
        
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title="Visualizar">
            <IconButton 
              size="small" 
              onClick={handleOpenModal}
              disabled={!['image', 'pdf', 'audio', 'video'].includes(fileType)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Baixar">
            <IconButton 
              size="small" 
              component="a" 
              href={fileUrl} 
              download 
              target="_blank"
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
      
      <StyledModal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="document-preview-modal"
        aria-describedby="modal-para-visualizar-documento"
      >
        <ModalContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              {fileName}
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          )}
          
          {renderModalContent()}
        </ModalContent>
      </StyledModal>
    </>
  );
};

export default DocumentPreview;
