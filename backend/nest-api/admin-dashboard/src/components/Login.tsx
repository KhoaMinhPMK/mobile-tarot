import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    try {
      if (loginType === 'email') {
        await login(email, null, password);
      } else {
        await login(null, phoneNumber, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setLocalError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Đăng nhập Admin Dashboard
          </Typography>
          
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || localError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Button 
                fullWidth
                variant={loginType === 'email' ? "contained" : "outlined"} 
                onClick={() => setLoginType('email')}
                sx={{ mr: 1 }}
              >
                Email
              </Button>
              <Button 
                fullWidth
                variant={loginType === 'phone' ? "contained" : "outlined"} 
                onClick={() => setLoginType('phone')}
                sx={{ mt: 1 }}
              >
                Số điện thoại
              </Button>
            </Box>
            
            {loginType === 'email' ? (
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                id="phoneNumber"
                label="Số điện thoại"
                name="phoneNumber"
                autoComplete="tel"
                autoFocus
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;