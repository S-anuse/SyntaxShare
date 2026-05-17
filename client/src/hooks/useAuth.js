import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Convenience hook to access the AuthContext values.
 * Usage: const { user, login, logout } = useAuth();
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
