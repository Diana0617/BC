import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../../../shared/src/constants/permissions';

/**
 * Local route protection component that doesn't use useLocation()
 * This avoids the "useLocation() outside Router" error during lazy loading
 */
export const OwnerOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== ROLES.OWNER) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== ROLES.ADMIN && user?.role !== ROLES.OWNER) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
