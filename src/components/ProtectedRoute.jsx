import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a spinner

  if (!user) {
    // Redirect to signup as requested, but save the intended location
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
