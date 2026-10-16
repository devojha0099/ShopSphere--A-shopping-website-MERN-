import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api/axios';

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    return (await api.post('/auth/register', data)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    return (await api.post('/auth/login', data)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/auth/me')).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null, initialized: false },
  reducers: {
    clearAuthError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    const pending = (s) => { s.loading = true; s.error = null; };
    const authed = (s, a) => { s.loading = false; s.user = a.payload; };
    const failed = (s, a) => { s.loading = false; s.error = a.payload; };

    b.addCase(registerUser.pending, pending).addCase(registerUser.fulfilled, authed).addCase(registerUser.rejected, failed);
    b.addCase(loginUser.pending, pending).addCase(loginUser.fulfilled, authed).addCase(loginUser.rejected, failed);
    b.addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.initialized = true; });
    b.addCase(fetchMe.rejected, (s) => { s.user = null; s.initialized = true; });
    b.addCase(logoutUser.fulfilled, (s) => { s.user = null; });
  },
});

export const { clearAuthError } = slice.actions;
export default slice.reducer;
