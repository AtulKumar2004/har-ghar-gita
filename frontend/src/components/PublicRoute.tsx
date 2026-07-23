import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';

const PublicRoute = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
