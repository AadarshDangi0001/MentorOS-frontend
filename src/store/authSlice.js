import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.auth.getMe();
      if (response.success && response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      throw new Error(response.message || 'Failed to fetch profile');
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return rejectWithValue(err.message || 'Failed to fetch profile');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.auth.login(email, password);
      if (response.success && response.data) {
        const { user: loggedUser, accessToken, refreshToken } = response.data;
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(loggedUser));
        return loggedUser;
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      return rejectWithValue(err.message || 'Incorrect email or password');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const response = await api.auth.register(name, email, password, role);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create account');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Backend logout failed:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
);

const initialState = {
  user: (() => {
    const cached = localStorage.getItem('user');
    try {
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  })(),
  loading: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateProfileState: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.user = null;
        state.loading = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state) => {
        state.loading = false;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const { updateProfileState, setLoading } = authSlice.actions;
export default authSlice.reducer;
