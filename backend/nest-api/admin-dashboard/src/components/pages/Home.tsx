import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { userAPI } from '../../services/api';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

interface UserStats {
  total: number;
  admins: number;
  users: number;
}

const Home: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserStats();
        console.log('User stats response:', response.data);
        setUserStats(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user stats:', err);
        // Log chi tiết lỗi để debug
        if (err.response) {
          // Lỗi từ phản hồi server
          console.error('Error response:', {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers,
          });
        } else if (err.request) {
          // Không nhận được phản hồi
          console.error('Error request:', err.request);
        } else {
          // Lỗi khi thiết lập request
          console.error('Error message:', err.message);
        }
        
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        // Fallback to mock data if API is not ready
        setUserStats({
          total: 0,
          admins: 0,
          users: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom component="h2">
        Tổng quan hệ thống
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flexBasis: { xs: '100%', md: '30%' }, flexGrow: 1 }}>
          <Item>
            <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="div">
              {userStats?.total || 0}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Tổng số người dùng
            </Typography>
          </Item>
        </Box>
        
        <Box sx={{ flexBasis: { xs: '100%', md: '30%' }, flexGrow: 1 }}>
          <Item>
            <AdminPanelSettingsIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" component="div">
              {userStats?.admins || 0}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Quản trị viên
            </Typography>
          </Item>
        </Box>
        
        <Box sx={{ flexBasis: { xs: '100%', md: '30%' }, flexGrow: 1 }}>
          <Item>
            <PersonIcon sx={{ fontSize: 60, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" component="div">
              {userStats?.users || 0}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Người dùng thường
            </Typography>
          </Item>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;