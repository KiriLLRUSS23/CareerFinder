import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  const getUser = useCallback((): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return !!localStorage.getItem('accessToken');
  }, []);

  return {
    login,
    logout,
    getUser,
    isAuthenticated,
  };
};