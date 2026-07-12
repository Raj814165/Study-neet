import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { api, setToken, removeToken, getToken } from '../config/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  // Check for existing token on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          try {
            const data = await api.get('/auth/me');
            if (data.success && data.user) {
              setUser(data.user);
              setUserRole(data.user.role || 'user');
            }
          } catch (error) {
            // Only remove token on explicit 401 (unauthorized)
            // Don't remove on network errors or server timeouts (Render cold start)
            if (error.message && (
              error.message.includes('401') ||
              error.message.includes('Not authorized') ||
              error.message.includes('token invalid')
            )) {
              console.log('Token expired, logging out');
              await removeToken();
            } else {
              // Network error or server issue — keep token, try again later
              console.log('Auth check failed (network issue, keeping token):', error.message);
              // Try to restore user from a retry after a delay
              setTimeout(async () => {
                try {
                  const retryData = await api.get('/auth/me');
                  if (retryData.success && retryData.user) {
                    setUser(retryData.user);
                    setUserRole(retryData.user.role || 'user');
                  }
                } catch (retryError) {
                  console.log('Auth retry also failed:', retryError.message);
                }
              }, 5000);
            }
          }
        }
      } catch (error) {
        console.log('Auth storage error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Re-check auth when app comes back to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground — re-validate session if user exists
        if (user) {
          try {
            const data = await api.get('/auth/me');
            if (data.success && data.user) {
              setUser(data.user);
              setUserRole(data.user.role || 'user');
            }
          } catch (error) {
            // Only logout on explicit auth failure
            if (error.message && (
              error.message.includes('401') ||
              error.message.includes('Not authorized') ||
              error.message.includes('token invalid')
            )) {
              await removeToken();
              setUser(null);
              setUserRole('user');
            }
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription?.remove();
  }, [user]);

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });

      if (data.success) {
        await setToken(data.token);
        setUser(data.user);
        setUserRole(data.user.role || 'user');
        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, displayName, role = 'user') => {
    try {
      const data = await api.post('/auth/register', {
        name: displayName,
        email,
        password,
        role,
      });

      if (data.success) {
        await setToken(data.token);
        setUser(data.user);
        setUserRole(data.user.role || 'user');
        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || 'Signup failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await removeToken();
      setUser(null);
      setUserRole('user');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      const data = await api.post(`/courses/${courseId}/enroll`);
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          enrolledCourses: data.enrolledCourses,
        }));
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to enroll' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const unenrollFromCourse = async (courseId) => {
    try {
      const data = await api.delete(`/courses/${courseId}/enroll`);
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          enrolledCourses: data.enrolledCourses,
        }));
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to unenroll' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (name) => {
    try {
      const data = await api.put('/auth/profile', { name });
      if (data.success) {
        setUser((prev) => ({ ...prev, ...data.user }));
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to update profile' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAdmin,
        loading,
        login,
        signup,
        logout,
        enrollInCourse,
        unenrollFromCourse,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
