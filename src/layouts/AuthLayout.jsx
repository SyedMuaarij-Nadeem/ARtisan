import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { user } = useAuth();

  // If user is already logged in, they shouldn't be on auth pages
  if (user) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}
