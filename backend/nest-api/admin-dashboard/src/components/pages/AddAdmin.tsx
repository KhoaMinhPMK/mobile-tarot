import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Stack,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import { userAPI } from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AddAdmin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra nếu cả email và số điện thoại đều trống
    if (!email && !phoneNumber) {
      setError('Vui lòng cung cấp ít nhất một trong email hoặc số điện thoại');
      return;
    }
    
    // Kiểm tra nếu mật khẩu trống
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await userAPI.createAdmin({
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        password
      });
      
      // Reset form sau khi thành công
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setSuccess(true);
    } catch (err: any) {
      console.error('Error creating admin:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Không thể tạo tài khoản admin. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h2">
          Tạo tài khoản admin mới
        </Typography>
        <AdminPanelSettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: 2,
          backgroundColor: theme => theme.palette.background.paper 
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Tài khoản admin đã được tạo thành công!
          </Alert>
        )}
        
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Thông tin xác thực
          </Typography>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '50%' } }}>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Email hoặc số điện thoại là bắt buộc"
              />
            </Box>
            <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '50%' } }}>
              <TextField
                margin="normal"
                fullWidth
                id="phoneNumber"
                label="Số điện thoại"
                name="phoneNumber"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                helperText="Email hoặc số điện thoại là bắt buộc"
              />
            </Box>
          </Stack>
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mt: 3 }}
          />
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Lưu ý: Bạn cần cung cấp ít nhất một trong email hoặc số điện thoại. 
              Nếu tài khoản đã tồn tại, nó sẽ được nâng cấp thành tài khoản admin.
            </Typography>
            
            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || (!email && !phoneNumber) || !password}
                startIcon={loading ? <CircularProgress size={24} /> : <AdminPanelSettingsIcon />}
                size="large"
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  borderRadius: 2,
                  boxShadow: 2
                }}
              >
                {loading ? 'Đang xử lý...' : 'Tạo admin'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddAdmin;