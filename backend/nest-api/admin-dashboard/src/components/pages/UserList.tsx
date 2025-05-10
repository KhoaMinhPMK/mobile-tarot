import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  TextField,
  Tooltip,
  InputAdornment,
  Chip,
  Stack,
  Divider,
  FormHelperText,
  Tab,
  Tabs
} from '@mui/material';
import { userAPI } from '../../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HistoryIcon from '@mui/icons-material/History';
import { format } from 'date-fns';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState<boolean>(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [coinDialogOpen, setCoinDialogOpen] = useState<boolean>(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState<boolean>(false);
  
  // Selected user and form states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [editedUserData, setEditedUserData] = useState<any>({});
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  
  // Coin adjustment states
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [coinNote, setCoinNote] = useState<string>('');
  const [coinLoading, setCoinLoading] = useState<boolean>(false);
  
  // Transaction history states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(false);
  
  // Tab state for edit dialog
  const [tabValue, setTabValue] = useState<number>(0);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Dialog handlers
  const handleOpenDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenRoleDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setRoleDialogOpen(true);
  };

  const handleCloseRoleDialog = () => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleOpenResetPasswordDialog = (user: any) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPassword(false);
    setResetPasswordDialogOpen(true);
  };

  const handleCloseResetPasswordDialog = () => {
    setResetPasswordDialogOpen(false);
    setSelectedUser(null);
    setNewPassword('');
    setShowPassword(false);
  };

  const handleOpenEditDialog = (user: any) => {
    setSelectedUser(user);
    setEditedUserData({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? format(new Date(user.dateOfBirth), 'yyyy-MM-dd') : '',
      password: '', // Password field is initially empty
      role: user.role || 'user',
      authProvider: user.authProvider || 'local',
    });
    setTabValue(0); // Reset to first tab
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
    setEditedUserData({});
    setSaveLoading(false);
    setShowPassword(false);
  };

  const handleOpenCoinDialog = (user: any) => {
    setSelectedUser(user);
    setCoinAmount(0);
    setCoinNote('');
    setCoinDialogOpen(true);
  };

  const handleCloseCoinDialog = () => {
    setCoinDialogOpen(false);
    setSelectedUser(null);
    setCoinAmount(0);
    setCoinNote('');
    setCoinLoading(false);
  };

  const handleOpenTransactionDialog = async (user: any) => {
    setSelectedUser(user);
    setTransactionDialogOpen(true);
    await fetchUserTransactions(user.id);
  };

  const handleCloseTransactionDialog = () => {
    setTransactionDialogOpen(false);
    setSelectedUser(null);
    setTransactions([]);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Form handlers
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUserData((prev: Record<string, any>) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setEditedUserData((prev: Record<string, any>) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Fetch transaction history
  const fetchUserTransactions = async (userId: number) => {
    try {
      setTransactionsLoading(true);
      const response = await userAPI.getUserCoinTransactions(userId);
      setTransactions(response.data);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Adjust user coins
  const handleAdjustCoin = async () => {
    if (!selectedUser || !coinNote) return;
    
    try {
      setCoinLoading(true);
      
      const coinData = {
        amount: coinAmount,
        note: coinNote
      };
      
      const response = await userAPI.adjustUserCoins(selectedUser.id, coinData);
      
      // Update user in the list with new coin balance
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, coinBalance: response.data.coinBalance } : user
      ));
      
      handleCloseCoinDialog();
    } catch (err: any) {
      console.error('Error adjusting coins:', err);
      setError('Không thể điều chỉnh số dư coin. Vui lòng thử lại sau.');
    } finally {
      setCoinLoading(false);
    }
  };

  // Action handlers
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await userAPI.deleteUser(selectedUser.id);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      handleCloseDeleteDialog();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError('Không thể xóa người dùng. Vui lòng thử lại sau.');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    try {
      await userAPI.updateUserRole(selectedUser.id, selectedRole);
      // Cập nhật danh sách người dùng sau khi cập nhật vai trò
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, role: selectedRole } : user
      ));
      handleCloseRoleDialog();
    } catch (err: any) {
      console.error('Error updating user role:', err);
      setError('Không thể cập nhật vai trò người dùng. Vui lòng thử lại sau.');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    
    try {
      const resetData = {
        ...(selectedUser.email ? { email: selectedUser.email } : {}),
        ...(selectedUser.phoneNumber ? { phoneNumber: selectedUser.phoneNumber } : {}),
        newPassword
      };
      
      await userAPI.resetPassword(resetData);
      handleCloseResetPasswordDialog();
      setError(null);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError('Không thể đặt lại mật khẩu. Vui lòng thử lại sau.');
    }
  };

  const handleSaveUserChanges = async () => {
    if (!selectedUser) return;
    
    try {
      setSaveLoading(true);
      
      // Prepare the data for update
      const updateData: any = {};
      
      // Include only changed fields
      if (editedUserData.fullName !== selectedUser.fullName) {
        updateData.fullName = editedUserData.fullName;
      }
      
      if (editedUserData.email !== selectedUser.email) {
        updateData.email = editedUserData.email || null; // Allow clearing email
      }
      
      if (editedUserData.phoneNumber !== selectedUser.phoneNumber) {
        updateData.phoneNumber = editedUserData.phoneNumber || null; // Allow clearing phone
      }
      
      if (editedUserData.gender !== selectedUser.gender) {
        updateData.gender = editedUserData.gender;
      }
      
      if (editedUserData.dateOfBirth !== (selectedUser.dateOfBirth ? format(new Date(selectedUser.dateOfBirth), 'yyyy-MM-dd') : '')) {
        updateData.dateOfBirth = editedUserData.dateOfBirth || null; // Allow clearing date
      }
      
      if (editedUserData.password) {
        updateData.password = editedUserData.password;
      }
      
      if (editedUserData.role !== selectedUser.role) {
        updateData.role = editedUserData.role;
      }
      
      if (Object.keys(updateData).length === 0) {
        handleCloseEditDialog();
        return; // No changes to save
      }
      
      // Update the user
      await userAPI.updateUser(selectedUser.id, updateData);
      
      // Update the local state
      const updatedUser = { 
        ...selectedUser,
        ...updateData,
        // Ensure these fields are properly formatted
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : selectedUser.dateOfBirth
      };
      
      setUsers(users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      
      handleCloseEditDialog();
      
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError('Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '(Chưa có)';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return '(Không hợp lệ)';
    }
  };

  const renderGenderLabel = (gender: string | null) => {
    if (!gender) return '(Chưa có)';
    
    switch (gender) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      case 'other':
        return 'Khác';
      default:
        return gender;
    }
  };

  const renderAuthProviderLabel = (provider: string | null) => {
    if (!provider) return '(Chưa có)';
    
    switch (provider) {
      case 'local':
        return 'Đăng ký thông thường';
      case 'google':
        return 'Google';
      default:
        return provider;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" gutterBottom component="h2" sx={{ mb: 0 }}>
          Quản lý người dùng
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.href = '/dashboard/add-user'}
          startIcon={<EditIcon />}
        >
          Tạo người dùng mới
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper} sx={{ mb: 4, overflow: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Giới tính</TableCell>
              <TableCell>Số coin</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.fullName || '(Chưa có)'}</TableCell>
                  <TableCell>{user.email || '(Chưa có)'}</TableCell>
                  <TableCell>{user.phoneNumber || '(Chưa có)'}</TableCell>
                  <TableCell>{renderGenderLabel(user.gender)}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<MonetizationOnIcon />}
                      label={user.coinBalance || 0}
                      color="warning"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role === 'admin' ? 'Admin' : 'Người dùng'}
                      color={user.role === 'admin' ? 'success' : 'primary'}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Chỉnh sửa thông tin">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Điều chỉnh coin">
                      <IconButton 
                        color="warning"
                        onClick={() => handleOpenCoinDialog(user)}
                      >
                        <MonetizationOnIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Lịch sử giao dịch coin">
                      <IconButton 
                        color="info"
                        onClick={() => handleOpenTransactionDialog(user)}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Đặt lại mật khẩu">
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleOpenResetPasswordDialog(user)}
                      >
                        <LockResetIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa người dùng">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Không có người dùng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialog điều chỉnh coin */}
      <Dialog
        open={coinDialogOpen}
        onClose={handleCloseCoinDialog}
        aria-labelledby="coin-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="coin-dialog-title">
          Điều chỉnh coin cho người dùng
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Điều chỉnh số coin cho người dùng{' '}
            {selectedUser?.fullName || selectedUser?.email || selectedUser?.phoneNumber || 'này'}.
            <br />
            Số coin hiện tại: <b>{selectedUser?.coinBalance || 0}</b>
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="normal"
            id="coin-amount"
            label="Số lượng coin"
            type="number"
            fullWidth
            value={coinAmount}
            onChange={(e) => setCoinAmount(Number(e.target.value))}
            helperText="Nhập số dương để thêm coin hoặc số âm để trừ coin"
            InputProps={{
              endAdornment: <InputAdornment position="end">coin</InputAdornment>,
            }}
          />
          
          <TextField
            margin="normal"
            id="coin-note"
            label="Ghi chú"
            type="text"
            fullWidth
            value={coinNote}
            onChange={(e) => setCoinNote(e.target.value)}
            helperText="Vui lòng nhập lý do điều chỉnh coin"
            required
          />
          
          {coinAmount !== 0 && (
            <Alert severity={coinAmount > 0 ? "success" : "warning"} sx={{ mt: 2 }}>
              Số coin mới sẽ là: <b>{(selectedUser?.coinBalance || 0) + coinAmount}</b>
              {coinAmount < 0 && (selectedUser?.coinBalance || 0) + coinAmount < 0 && (
                <Typography variant="caption" component="div" color="error">
                  Cảnh báo: Số coin không thể âm. Giao dịch sẽ bị từ chối.
                </Typography>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCoinDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleAdjustCoin} 
            color="primary" 
            variant="contained"
            disabled={coinAmount === 0 || !coinNote || coinLoading || (coinAmount < 0 && (selectedUser?.coinBalance || 0) + coinAmount < 0)}
          >
            {coinLoading ? <CircularProgress size={24} /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog lịch sử giao dịch coin */}
      <Dialog
        open={transactionDialogOpen}
        onClose={handleCloseTransactionDialog}
        aria-labelledby="transaction-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="transaction-dialog-title">
          Lịch sử giao dịch coin
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Lịch sử giao dịch coin của người dùng{' '}
            {selectedUser?.fullName || selectedUser?.email || selectedUser?.phoneNumber || 'này'}.
            <br />
            Số coin hiện tại: <b>{selectedUser?.coinBalance || 0}</b>
          </DialogContentText>
          
          {transactionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Ngày giao dịch</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Ghi chú</TableCell>
                    <TableCell>Người thực hiện</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type === 'deposit' ? 'Nạp' : 'Trừ'}
                            color={transaction.type === 'deposit' ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{transaction.note}</TableCell>
                        <TableCell>{transaction.performedBy}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Chưa có giao dịch nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDialog} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xóa người dùng */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa người dùng
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa người dùng{' '}
            {selectedUser?.fullName || selectedUser?.email || selectedUser?.phoneNumber || 'này'}?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={handleDeleteUser} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog cập nhật vai trò */}
      <Dialog
        open={roleDialogOpen}
        onClose={handleCloseRoleDialog}
        aria-labelledby="role-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="role-dialog-title">
          Cập nhật vai trò người dùng
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Thay đổi vai trò cho người dùng{' '}
            {selectedUser?.fullName || selectedUser?.email || selectedUser?.phoneNumber || 'này'}:
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Vai trò</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole}
              label="Vai trò"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="user">Người dùng</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={handleUpdateRole} color="primary" autoFocus>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog đặt lại mật khẩu */}
      <Dialog
        open={resetPasswordDialogOpen}
        onClose={handleCloseResetPasswordDialog}
        aria-labelledby="reset-password-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="reset-password-dialog-title">
          Đặt lại mật khẩu người dùng
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Nhập mật khẩu mới cho người dùng{' '}
            {selectedUser?.fullName || selectedUser?.email || selectedUser?.phoneNumber || 'này'}:
          </DialogContentText>
          <TextField
            autoFocus
            margin="normal"
            id="new-password"
            label="Mật khẩu mới"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetPasswordDialog} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleResetPassword} 
            color="primary" 
            autoFocus
            disabled={!newPassword}
          >
            Đặt lại
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa thông tin người dùng */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        aria-labelledby="edit-user-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="edit-user-dialog-title" sx={{ pb: 1 }}>
          Chỉnh sửa thông tin người dùng
        </DialogTitle>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="user edit tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Thông tin cơ bản" />
            <Tab label="Thông tin xác thực" />
            <Tab label="Thông tin hệ thống" />
          </Tabs>
        </Box>
        
        <DialogContent>
          {/* Tab 1: Thông tin cơ bản */}
          {tabValue === 0 && (
            <Box>
              <TextField
                margin="normal"
                fullWidth
                id="fullName"
                label="Họ và tên"
                name="fullName"
                value={editedUserData.fullName || ''}
                onChange={handleEditChange}
              />
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="gender-label">Giới tính</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={editedUserData.gender || ''}
                    label="Giới tính"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">Chưa chọn</MenuItem>
                    <MenuItem value="male">Nam</MenuItem>
                    <MenuItem value="female">Nữ</MenuItem>
                    <MenuItem value="other">Khác</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="dateOfBirth"
                  label="Ngày sinh"
                  name="dateOfBirth"
                  type="date"
                  value={editedUserData.dateOfBirth || ''}
                  onChange={handleEditChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Stack>
            </Box>
          )}
          
          {/* Tab 2: Thông tin xác thực */}
          {tabValue === 1 && (
            <Box>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  value={editedUserData.email || ''}
                  onChange={handleEditChange}
                  helperText={
                    editedUserData.authProvider === 'google' ? 
                    'Cảnh báo: Email này được liên kết với tài khoản Google' : 
                    'Email có thể để trống nếu có số điện thoại'
                  }
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="phoneNumber"
                  label="Số điện thoại"
                  name="phoneNumber"
                  value={editedUserData.phoneNumber || ''}
                  onChange={handleEditChange}
                  helperText="Số điện thoại có thể để trống nếu có email"
                />
              </Stack>
              
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Mật khẩu mới (để trống nếu không thay đổi)"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={editedUserData.password || ''}
                onChange={handleEditChange}
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
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="auth-provider-label">Phương thức đăng nhập</InputLabel>
                <Select
                  labelId="auth-provider-label"
                  id="authProvider"
                  name="authProvider"
                  value={editedUserData.authProvider || 'local'}
                  label="Phương thức đăng nhập"
                  onChange={handleSelectChange}
                  disabled={true} // Không cho phép thay đổi phương thức đăng nhập
                >
                  <MenuItem value="local">Đăng ký thông thường</MenuItem>
                  <MenuItem value="google">Google</MenuItem>
                </Select>
                <FormHelperText>Phương thức đăng nhập không thể thay đổi</FormHelperText>
              </FormControl>
            </Box>
          )}
          
          {/* Tab 3: Thông tin hệ thống */}
          {tabValue === 2 && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-edit-label">Vai trò người dùng</InputLabel>
                <Select
                  labelId="role-edit-label"
                  id="role"
                  name="role"
                  value={editedUserData.role || 'user'}
                  label="Vai trò người dùng"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="user">Người dùng</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              
              {selectedUser && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ID: {selectedUser.id}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Ngày tạo: {formatDate(selectedUser.createdAt)}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cập nhật lần cuối: {formatDate(selectedUser.updatedAt)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleSaveUserChanges} 
            variant="contained"
            color="primary" 
            autoFocus
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={24} /> : <SaveIcon />}
          >
            {saveLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList;