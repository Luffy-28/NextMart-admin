import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Deals from './pages/Deals';
import Refunds from './pages/Refunds';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useDispatch, useSelector } from 'react-redux';
import { autoLogin } from './features/admin/adminAction';

// Protected Route Wrapper: Redirects to login if not authenticated
const ProtectedRoute = () => {
  const { user, loading } = useSelector((state) => state.adminStore);
  const token = localStorage.getItem("accessToken");

  if (loading || (token && !user)) {
    return <LoadingSpinner fullPage />;
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
};

// Public Route Wrapper: Redirects to dashboard if already authenticated
const PublicRoute = () => {
  const { user, loading } = useSelector((state) => state.adminStore);
  const token = localStorage.getItem("accessToken");

  if (loading || (token && !user)) {
    return <LoadingSpinner fullPage />;
  }

  return user ? <Navigate to="/dashboard" replace /> : <Login />;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(autoLogin());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login View */}
        <Route path="/" element={<PublicRoute />} />
        
        {/* Administrative Layout Scaffolding Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        
        {/* Wildcard Fallback redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
