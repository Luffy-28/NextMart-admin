import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Deals from './pages/Deals';
import Refunds from './pages/Refunds';
import { useDispatch } from 'react-redux';
import { autoLogin } from './features/admin/adminAction';

function App() {
const dispatch = useDispatch();

useEffect(()=>{
  dispatch(autoLogin())
},[dispatch])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login View */}
        <Route path="/" element={<Login />} />
        
        {/* Administrative Layout Scaffolding Shell */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/refunds" element={<Refunds />} />
        </Route>
        
        {/* Wildcard Fallback redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
