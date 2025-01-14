import React, { useState } from 'react';
import { 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Typography, 
  Box 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationsMenu = ({ notifications = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="large"
        aria-label="show notifications"
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">Sem notificações</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification, index) => (
            <MenuItem key={index} onClick={handleClose}>
              <Box>
                <Typography variant="body2">{notification.message}</Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu;
