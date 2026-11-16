import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

  // SYNCHRONOUS INITIALIZATION from sessionStorage
  const [user, setUser] = useState(() => {
    const savedData = sessionStorage.getItem('userData');
    try {
      return savedData ? JSON.parse(savedData) : null;
    } catch (e) {
      return null;
    }
  });

  // Loading is true only if we have a token to verify
  const [loading, setLoading] = useState(() => {
    return !!sessionStorage.getItem('accessToken');
  });

  // BACKGROUND VERIFICATION on every page load/refresh
  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          // ─────────────────────────────────────────
          // FIX: Backend returns { data: { user: {...} } }
          // Must extract .user from data
          // ─────────────────────────────────────────
          const freshUserData = res.data.data.user;

          // Safety check — if role is missing something is wrong
          if (!freshUserData || !freshUserData.role) {
            console.error('Role missing from /auth/me response');
            handleLogout();
            return;
          }

          // Update state and storage with fresh data from backend
          setUser(freshUserData);
          sessionStorage.setItem('userData', JSON.stringify(freshUserData));
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // LOGIN function
  const login = async (identifier, password, expected_role) => {
    // Clear any previous tab data first
    sessionStorage.clear();

    const res = await api.post('/auth/login', {
      identifier,
      password,
      expected_role,
    });

    if (res.data.success) {
      // ─────────────────────────────────────────
      // Backend login returns { data: { user, accessToken, refreshToken } }
      // ─────────────────────────────────────────
      const { accessToken, refreshToken, user: userData } = res.data.data;

      // Safety check — confirm role exists before saving
      if (!userData || !userData.role) {
        throw new Error('Invalid response from server. Role missing.');
      }

      // Save to sessionStorage (isolated per tab)
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('userData', JSON.stringify(userData));
      sessionStorage.setItem('userRole', userData.role);

      setUser(userData);
      setLoading(false);
    }

    return res.data;
  };

  // LOGOUT function
  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
    setLoading(false);
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout: handleLogout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);