import React, { useState, useEffect, useCallback } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Tooltip,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  ListItemAvatar,
  Button,
  CircularProgress,
  Popover,
  Paper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { Notification, NotificationType } from '../types/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    padding: theme.spacing(2),
    ...(open && {
      marginLeft: '0',
    }),
  },
}));

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // States for notifications
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  // Profile menu handlers
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/');
  };
  
  // Notification handlers
  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationAPI.getMyNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [fetchUnreadCount]);

  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationAPI.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }, []);

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.COIN:
        return <MonetizationOnIcon color="warning" />;
      case NotificationType.USER:
        return <PersonIcon color="primary" />;
      case NotificationType.ANNOUNCEMENT:
        return <NotificationsIcon color="success" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };
  
  // Load unread count on component mount
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Refresh unread count every minute
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);
  
  const navigateTo = (path: string) => {
    navigate(path);
  };
  
  const menuId = 'primary-account-menu';
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationOpen = Boolean(notificationAnchorEl);
  const notificationId = isNotificationOpen ? 'notification-popover' : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open} color="default">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Admin Dashboard
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Thông báo">
              <IconButton 
                size="large" 
                color="inherit" 
                onClick={handleNotificationOpen}
                aria-describedby={notificationId}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Box sx={{ ml: 2 }}>
              <Tooltip title="Tài khoản">
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.main',
                      boxShadow: '0 0 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBarStyled>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Hồ sơ</MenuItem>
        <MenuItem onClick={handleMenuClose}>Cài đặt</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
      
      {/* Notification Popover */}
      <Popover
        id={notificationId}
        open={isNotificationOpen}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ width: 360, maxHeight: 480, overflow: 'auto' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <Typography variant="h6">Thông báo</Typography>
            <Box>
              {notifications.length > 0 && (
                <>
                  <Button size="small" onClick={markAllAsRead} sx={{ mr: 1 }}>
                    Đánh dấu đã đọc
                  </Button>
                  <Tooltip title="Xóa tất cả">
                    <IconButton size="small" onClick={clearAllNotifications}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
          
          {loadingNotifications ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              {notifications.length > 0 ? (
                <List sx={{ py: 0 }}>
                  {notifications.map((notification) => (
                    <ListItem 
                      key={notification.id}
                      disablePadding
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                      sx={{
                        bgcolor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                      }}
                    >
                      <ListItemButton onClick={() => markNotificationAsRead(notification.id)}>
                        <ListItemAvatar>
                          <Avatar>{getNotificationIcon(notification.type)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={notification.title}
                          secondary={
                            <>
                              <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                                {notification.content}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                {formatDate(notification.createdAt)}
                              </Typography>
                            </>
                          }
                          primaryTypographyProps={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có thông báo nào.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Popover>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user?.fullName || user?.email || user?.phoneNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'} 
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigateTo('/dashboard')} selected={window.location.pathname === '/dashboard'}>
              <ListItemIcon>
                <DashboardIcon color={window.location.pathname === '/dashboard' ? 'primary' : undefined} />
              </ListItemIcon>
              <ListItemText 
                primary="Tổng quan" 
                primaryTypographyProps={{ 
                  fontWeight: window.location.pathname === '/dashboard' ? 700 : 400 
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigateTo('/dashboard/users')}
              selected={window.location.pathname === '/dashboard/users'}
            >
              <ListItemIcon>
                <PersonIcon color={window.location.pathname === '/dashboard/users' ? 'primary' : undefined} />
              </ListItemIcon>
              <ListItemText 
                primary="Quản lý người dùng" 
                primaryTypographyProps={{ 
                  fontWeight: window.location.pathname === '/dashboard/users' ? 700 : 400 
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigateTo('/dashboard/coin-stats')}
              selected={window.location.pathname === '/dashboard/coin-stats'}
            >
              <ListItemIcon>
                <MonetizationOnIcon color={window.location.pathname === '/dashboard/coin-stats' ? 'primary' : undefined} />
              </ListItemIcon>
              <ListItemText 
                primary="Thống kê Coin" 
                primaryTypographyProps={{ 
                  fontWeight: window.location.pathname === '/dashboard/coin-stats' ? 700 : 400 
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigateTo('/dashboard/add-user')}
              selected={window.location.pathname === '/dashboard/add-user'}
            >
              <ListItemIcon>
                <PersonAddIcon color={window.location.pathname === '/dashboard/add-user' ? 'primary' : undefined} />
              </ListItemIcon>
              <ListItemText 
                primary="Tạo người dùng mới" 
                primaryTypographyProps={{ 
                  fontWeight: window.location.pathname === '/dashboard/add-user' ? 700 : 400 
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigateTo('/dashboard/add-admin')}
              selected={window.location.pathname === '/dashboard/add-admin'}
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon color={window.location.pathname === '/dashboard/add-admin' ? 'primary' : undefined} />
              </ListItemIcon>
              <ListItemText 
                primary="Tạo admin mới" 
                primaryTypographyProps={{ 
                  fontWeight: window.location.pathname === '/dashboard/add-admin' ? 700 : 400 
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
          <Outlet />
        </Container>
      </Main>
    </Box>
  );
};

export default Dashboard;