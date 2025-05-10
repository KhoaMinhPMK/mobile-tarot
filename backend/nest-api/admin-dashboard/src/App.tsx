import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Home from './components/pages/Home';
import UserList from './components/pages/UserList';
import AddUser from './components/pages/AddUser';
import AddAdmin from './components/pages/AddAdmin';
import CoinStats from './components/pages/CoinStats';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route component
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? (
    <>{element}</>
  ) : (
    <Navigate to="/" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />}>
            <Route index element={<Home />} />
            <Route path="users" element={<UserList />} />
            <Route path="coin-stats" element={<CoinStats />} />
            <Route path="add-user" element={<AddUser />} />
            <Route path="add-admin" element={<AddAdmin />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
