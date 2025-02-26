import React, { useState } from 'react';
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
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const DocumentPreview = ({ document }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getIconByType = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <PdfIcon sx={{ fontSize: 40, color: '#e94335' }} />;
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon sx={{ fontSize: 40, color: '#34a853' }} />;
      default:
        return <DocIcon sx={{ fontSize: 40, color: '#4285f4' }} />;
    }
  };

  const getFileExtension = (filename) => {
    return filename?.split('.')?.pop()?.toLowerCase() || '';
  };

  const handleDownload = () => {
    if (document?.url) {
      window.open(document.url, '_blank');
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
    setLoading(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  if (!document) return null;

  const fileType = document.type || getFileExtension(document.filename);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'image'].includes(fileType);
  const isPdf = fileType === 'pdf';
  const canPreview = isImage || isPdf;

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          m: 1,
          maxWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
        }}
      >
        {/* Miniatura do documento */}
        {isImage && document.url ? (
          <Box
            component="img"
            src={document.url}
            alt={document.filename}
            sx={{
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
              borderRadius: 1,
              mb: 1,
            }}
          />
        ) : (
          <Box sx={{ mb: 1 }}>
            {getIconByType(fileType)}
          </Box>
        )}

        {/* Nome do arquivo */}
        <Typography
          variant="body2"
          sx={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 1,
          }}
        >
          {document.filename}
        </Typography>

        {/* Botões de ação */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canPreview && (
            <IconButton
              onClick={handlePreview}
              size="small"
              sx={{
                backgroundColor: '#e8f5e9',
                '&:hover': {
                  backgroundColor: '#c8e6c9',
                },
              }}
              title="Visualizar"
            >
              <ViewIcon />
            </IconButton>
          )}
          
          <IconButton
            onClick={handleDownload}
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              '&:hover': {
                backgroundColor: '#bbdefb',
              },
            }}
            title="Baixar"
          >
            <DownloadIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Dialog para visualização do documento */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogActions>
          <IconButton onClick={handleClosePreview}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {loading && (
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <CircularProgress />
            </Box>
          )}
          
          {isImage ? (
            <img 
              src={document.url} 
              alt={document.filename} 
              style={{ maxWidth: '100%', maxHeight: '70vh' }} 
              onLoad={handleImageLoad}
            />
          ) : isPdf ? (
            <iframe 
              src={document.url} 
              title={document.filename} 
              width="100%" 
              height="500px" 
              onLoad={handleImageLoad}
            />
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1">
                Este tipo de documento não pode ser visualizado diretamente.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleDownload} 
                sx={{ mt: 2 }}
              >
                Baixar documento
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentPreview;
