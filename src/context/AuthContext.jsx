import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from '../store';
import { useToast } from '../components/common/Toast';
import { fetchProfile, login, register, logout, updateProfileState } from '../store/authSlice';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthContextShim = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const { showSuccess, showError, showInfo } = useToast();

  const handleFetchProfile = useCallback(async () => {
    try {
      await dispatch(fetchProfile()).unwrap();
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      handleFetchProfile();
    }
  }, [handleFetchProfile]);

  const handleLogin = async (email, password) => {
    try {
      const loggedUser = await dispatch(login({ email, password })).unwrap();
      showSuccess(`Welcome back, ${loggedUser.name}!`);
      return loggedUser;
    } catch (err) {
      showError(err || 'Incorrect email or password');
      throw err;
    }
  };

  const handleRegister = async (name, email, password, role) => {
    try {
      const data = await dispatch(register({ name, email, password, role })).unwrap();
      showSuccess('Account created successfully! Please verify your email.');
      return data;
    } catch (err) {
      showError(err || 'Failed to create account');
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (err) {
      console.warn('Backend logout failed:', err);
    } finally {
      showInfo('Logged out successfully');
    }
  };

  const handleUpdateProfileState = (updatedUser) => {
    dispatch(updateProfileState(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshProfile: handleFetchProfile,
        updateProfileState: handleUpdateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthContextShim>{children}</AuthContextShim>
    </Provider>
  );
};
