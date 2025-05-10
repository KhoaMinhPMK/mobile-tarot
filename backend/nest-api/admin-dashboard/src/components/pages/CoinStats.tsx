import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  Grid,
  Button,
  Tooltip
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupIcon from '@mui/icons-material/Group';
import RefreshIcon from '@mui/icons-material/Refresh';
import { userAPI } from '../../services/api';
import { format } from 'date-fns';

const CoinStats: React.FC = () => {
  const [coinStats, setCoinStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchCoinStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await userAPI.getTotalSystemCoins();
      setCoinStats(response.data);
      
      if (response.data.recentTransactions) {
        setRecentTransactions(response.data.recentTransactions);
      }
      
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Error fetching coin stats:', err);
      setError('Không thể tải thống kê coin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCoinStats();
  }, [fetchCoinStats]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchCoinStats(true);
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [fetchCoinStats]);

  const handleRefresh = () => {
    fetchCoinStats(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '(Chưa có)';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss');
    } catch (e) {
      return '(Không hợp lệ)';
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          Thống kê Coin hệ thống
        </Typography>
        
        <Box>
          <Tooltip title="Làm mới dữ liệu">
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              disabled={refreshing}
            >
              {refreshing ? 'Đang làm mới...' : 'Làm mới'}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Dữ liệu được cập nhật lần cuối: {formatDate(lastRefreshed.toISOString())}
      </Typography>

      {coinStats && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '22%' }, flexGrow: 1 }}>
            <Card sx={{ 
              height: '100%', 
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MonetizationOnIcon fontSize="large" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Tổng Coin
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mt: 2 }}>
                  {coinStats.totalCoins || 0}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Tổng số coin trong hệ thống
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '22%' }, flexGrow: 1 }}>
            <Card sx={{ 
              height: '100%',
              bgcolor: 'success.light',
              color: 'success.contrastText',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon fontSize="large" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Tổng nạp
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mt: 2 }}>
                  {coinStats.totalDeposits || 0}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Số coin đã nạp cho người dùng
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '22%' }, flexGrow: 1 }}>
            <Card sx={{ 
              height: '100%',
              bgcolor: 'error.light',
              color: 'error.contrastText',
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDownIcon fontSize="large" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Tổng trừ
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mt: 2 }}>
                  {coinStats.totalWithdrawals || 0}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Số coin đã trừ từ người dùng
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flexBasis: { xs: '100%', sm: '45%', md: '22%' }, flexGrow: 1 }}>
            <Card sx={{ 
              height: '100%',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupIcon fontSize="large" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Người dùng
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mt: 2 }}>
                  {coinStats.usersWithCoins || 0}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Số người dùng có coin
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Lịch sử giao dịch gần đây
        </Typography>
        
        <TableContainer>
          <Table sx={{ minWidth: 800 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Ngày giao dịch</TableCell>
                <TableCell>Người dùng</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Ghi chú</TableCell>
                <TableCell>Người thực hiện</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.length > 0 ? (
                recentTransactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>{transaction.user?.fullName || transaction.user?.email || transaction.user?.phoneNumber || transaction.userId}</TableCell>
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
                  <TableCell colSpan={7} align="center">
                    Chưa có giao dịch nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={recentTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Dòng trên trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default CoinStats;