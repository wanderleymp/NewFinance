import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Pagination,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function CardView({
  items = [],
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
  renderContent,
  loading = false,
}) {
  return (
    <Box>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {renderContent(item)}
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                <IconButton size="small" onClick={() => onEdit(item)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(item)} color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(_, newPage) => onPageChange(newPage - 1)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
