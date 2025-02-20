import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  InputBase,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Divider,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Message as MessageIcon,
  DonutLarge as StatusIcon,
  ArrowBack as ArrowBackIcon,
  InsertEmoticon as EmojiIcon,
  AttachFile as AttachIcon,
  Mic as MicIcon,
  Send as SendIcon,
  Archive as ArchiveIcon,
  Group as GroupIcon,
  NotificationsOff as MuteIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Componentes estilizados
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const LeftSidebar = styled(Box)(({ theme }) => ({
  width: '70px',
  backgroundColor: '#f0f2f5',
  borderRight: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2, 1),
}));

const SidebarIcon = styled(IconButton)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: '#54656f',
  '&:hover': {
    backgroundColor: '#e9edef',
  },
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '30%',
  minWidth: 300,
  maxWidth: 420,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: '#f0f2f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const SearchBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: '#ffffff',
}));

const SearchInput = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 2),
  borderRadius: 8,
  backgroundColor: '#f0f2f5',
  '&:hover': {
    backgroundColor: '#e9edef',
  },
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  gap: theme.spacing(1),
  backgroundColor: '#ffffff',
}));

const FilterButton = styled(Button)(({ theme, active }) => ({
  textTransform: 'none',
  borderRadius: 16,
  padding: theme.spacing(0.5, 2),
  backgroundColor: active ? '#e9edef' : 'transparent',
  color: '#54656f',
  '&:hover': {
    backgroundColor: '#e9edef',
  },
}));

const ChatListItem = styled(ListItem)(({ theme, selected }) => ({
  cursor: 'pointer',
  padding: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: '#f5f6f6',
  },
  ...(selected && {
    backgroundColor: '#f0f2f5',
  }),
}));

const ChatMainArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#efeae2',
  backgroundImage: 'url("/chat-background.png")',
  backgroundRepeat: 'repeat',
  position: 'relative',
}));

const MessageInputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: '#f0f2f5',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const NotificationBanner = styled(Box)(({ theme }) => ({
  backgroundColor: '#a3e2cf',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const WhatsAppStyleChat = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('todas');
  const [chats, setChats] = useState([
    {
      id: 1,
      name: 'AGILE Atendimento',
      lastMessage: '✓ joia',
      time: '18:27',
      unread: 0,
      avatar: null,
    },
    {
      id: 2,
      name: '+55 51 9795-7349',
      lastMessage: 'Bom dia, Wanderley! Tudo bem? Aqui é o Rodrigo...',
      time: '12:41',
      unread: 0,
      avatar: null,
    },
    {
      id: 3,
      name: '+55 11 95497-6912',
      lastMessage: 'SISTEMA VERI.pdf',
      time: '09:20',
      unread: 0,
      avatar: null,
    },
    {
      id: 4,
      name: 'Itaú',
      lastMessage: 'Olá! Identificamos uma compra negada no seu c...',
      time: '01:22',
      unread: 0,
      avatar: null,
    },
    {
      id: 5,
      name: '+55 69 9314-8711',
      lastMessage: 'Ligação de voz perdida',
      time: 'Ontem',
      unread: 0,
      avatar: null,
    },
  ]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <ChatContainer>
      <LeftSidebar>
        <SidebarIcon>
          <MessageIcon />
        </SidebarIcon>
        <SidebarIcon>
          <GroupIcon />
        </SidebarIcon>
        <SidebarIcon>
          <ArchiveIcon />
        </SidebarIcon>
        <SidebarIcon>
          <MuteIcon />
        </SidebarIcon>
        <SidebarIcon>
          <SettingsIcon />
        </SidebarIcon>
      </LeftSidebar>

      <SidebarContainer>
        <Header>
          <Avatar />
          <Box>
            <IconButton>
              <StatusIcon />
            </IconButton>
            <IconButton>
              <MessageIcon />
            </IconButton>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Header>

        <NotificationBanner>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon sx={{ color: '#2d3a41' }} />
            <Typography>Ative a sincronização em segundo plano</Typography>
          </Box>
          <IconButton size="small" sx={{ color: '#2d3a41' }}>
            <AddIcon />
          </IconButton>
        </NotificationBanner>
        
        <SearchBar>
          <SearchInput elevation={0}>
            <IconButton size="small">
              <SearchIcon />
            </IconButton>
            <InputBase
              fullWidth
              placeholder="Pesquisar ou começar uma nova conversa"
              value={searchTerm}
              onChange={handleSearch}
            />
            <IconButton size="small">
              <FilterIcon />
            </IconButton>
          </SearchInput>
        </SearchBar>

        <FilterContainer>
          <FilterButton
            active={activeFilter === 'todas'}
            onClick={() => handleFilterChange('todas')}
          >
            Tudo
          </FilterButton>
          <FilterButton
            active={activeFilter === 'nao-lidas'}
            onClick={() => handleFilterChange('nao-lidas')}
          >
            Não lidas
          </FilterButton>
          <FilterButton
            active={activeFilter === 'favoritas'}
            onClick={() => handleFilterChange('favoritas')}
          >
            Favoritas
          </FilterButton>
          <FilterButton
            active={activeFilter === 'grupos'}
            onClick={() => handleFilterChange('grupos')}
          >
            Grupos
          </FilterButton>
        </FilterContainer>

        <List sx={{ flex: 1, overflow: 'auto' }}>
          {chats.map((chat) => (
            <React.Fragment key={chat.id}>
              <ChatListItem
                selected={selectedChat?.id === chat.id}
                onClick={() => setSelectedChat(chat)}
              >
                <ListItemAvatar>
                  <Avatar src={chat.avatar}>
                    {!chat.avatar && chat.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={chat.name}
                  secondary={chat.lastMessage}
                  secondaryTypographyProps={{
                    noWrap: true,
                    style: { maxWidth: '70%' }
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography variant="caption" color="textSecondary">
                    {chat.time}
                  </Typography>
                  {chat.unread > 0 && (
                    <Badge
                      badgeContent={chat.unread}
                      color="primary"
                      sx={{ marginTop: 0.5 }}
                    />
                  )}
                </Box>
              </ChatListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </SidebarContainer>

      <ChatMainArea>
        {selectedChat ? (
          <>
            <Header>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar src={selectedChat.avatar}>
                  {!selectedChat.avatar && selectedChat.name.charAt(0)}
                </Avatar>
                <Typography variant="subtitle1">{selectedChat.name}</Typography>
              </Box>
              <Box>
                <IconButton>
                  <SearchIcon />
                </IconButton>
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Header>

            <Box sx={{ flex: 1, overflow: 'auto', padding: 2 }}>
              {/* Área de mensagens */}
            </Box>

            <MessageInputContainer>
              <IconButton>
                <EmojiIcon />
              </IconButton>
              <IconButton>
                <AttachIcon />
              </IconButton>
              <InputBase
                fullWidth
                multiline
                maxRows={4}
                placeholder="Digite uma mensagem"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: 2,
                  padding: '8px 16px',
                }}
              />
              <IconButton onClick={handleSendMessage}>
                {message.trim() ? <SendIcon /> : <MicIcon />}
              </IconButton>
            </MessageInputContainer>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#54656f',
            }}
          >
            <Typography variant="h6">
              Selecione um chat para começar
            </Typography>
          </Box>
        )}
      </ChatMainArea>
    </ChatContainer>
  );
};

export default WhatsAppStyleChat;
