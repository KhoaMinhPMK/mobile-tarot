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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider
} from '@mui/material';
import { userAPI } from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const AddUser: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    gender: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email && !formData.phoneNumber) {
      setError('Vui lòng cung cấp ít nhất một trong email hoặc số điện thoại');
      return;
    }
    
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await userAPI.createUser({
        fullName: formData.fullName || undefined,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        password: formData.password,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        authProvider: 'local'
      });
      
      // Reset form sau khi thành công
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        gender: '',
        dateOfBirth: '',
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Error creating user:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Không thể tạo người dùng. Vui lòng thử lại sau.');
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
          Tạo người dùng mới
        </Typography>
        <PersonAddIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
            Người dùng đã được tạo thành công!
          </Alert>
        )}
        
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Thông tin cơ bản
          </Typography>
          
          <TextField
            margin="normal"
            fullWidth
            id="fullName"
            label="Họ và tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '50%' } }}>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
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
                value={formData.phoneNumber}
                onChange={handleChange}
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
            value={formData.password}
            onChange={handleChange}
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
          
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Thông tin thêm (không bắt buộc)
          </Typography>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '50%' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="gender-label">Giới tính</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  label="Giới tính"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '50%' } }}>
              <TextField
                margin="normal"
                fullWidth
                id="dateOfBirth"
                label="Ngày sinh"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </Stack>
          
          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || (!formData.email && !formData.phoneNumber) || !formData.password}
              startIcon={loading ? <CircularProgress size={24} /> : <PersonAddIcon />}
              size="large"
              sx={{ 
                py: 1.5, 
                px: 4,
                borderRadius: 2,
                boxShadow: 2
              }}
            >
              {loading ? 'Đang xử lý...' : 'Tạo người dùng'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddUser;