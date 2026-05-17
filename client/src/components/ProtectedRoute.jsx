import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

/**
 * Wraps protected routes. Redirects to /login if the user is not authenticated.
 * Shows nothing while the auth state is loading (prevents flash of redirect).
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a loading spinner
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
