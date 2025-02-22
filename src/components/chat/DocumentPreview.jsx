import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const DocumentPreview = ({ document }) => {
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

  if (!document) return null;

  const fileType = getFileExtension(document.filename);
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileType);

  return (
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

      <IconButton
        onClick={handleDownload}
        size="small"
        sx={{
          backgroundColor: '#e3f2fd',
          '&:hover': {
            backgroundColor: '#bbdefb',
          },
        }}
      >
        <DownloadIcon />
      </IconButton>
    </Paper>
  );
};

export default DocumentPreview;
