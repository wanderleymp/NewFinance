import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Paper 
} from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { nfseService } from './nfseService';
import { Nfse } from './nfseTypes';
import { NfseCard } from './nfseCard';

const STATUSES = [
  'PENDENTE', 
  'EMITIDA', 
  'PROCESSANDO', 
  'CANCELADA'
];

export const NfseKanban: React.FC = () => {
  const [nfses, setNfses] = useState<{[key: string]: Nfse[]}>({});

  const fetchNfses = async () => {
    try {
      const response = await nfseService.listNfse({ limit: 100 });
      const groupedNfses = response.items.reduce((acc, nfse) => {
        const status = nfse.invoice.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(nfse);
        return acc;
      }, {} as {[key: string]: Nfse[]});
      setNfses(groupedNfses);
    } catch (error) {
      console.error('Erro ao buscar NFSes:', error);
    }
  };

  useEffect(() => {
    fetchNfses();
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    if (sourceStatus === destStatus) {
      const updatedColumn = [...nfses[sourceStatus]];
      const [reorderedItem] = updatedColumn.splice(source.index, 1);
      updatedColumn.splice(destination.index, 0, reorderedItem);

      setNfses(prev => ({
        ...prev,
        [sourceStatus]: updatedColumn
      }));
    } else {
      const sourceColumn = [...nfses[sourceStatus]];
      const destColumn = [...nfses[destStatus]];
      const [removed] = sourceColumn.splice(source.index, 1);
      destColumn.splice(destination.index, 0, removed);

      setNfses(prev => ({
        ...prev,
        [sourceStatus]: sourceColumn,
        [destStatus]: destColumn
      }));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Grid container spacing={2}>
        {STATUSES.map(status => (
          <Grid item xs key={status}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6" align="center">{status}</Typography>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    style={{ minHeight: '400px' }}
                  >
                    {nfses[status]?.map((nfse, index) => (
                      <Draggable 
                        key={nfse.nfseId} 
                        draggableId={String(nfse.nfseId)} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <NfseCard nfse={nfse} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </DragDropContext>
  );
};
