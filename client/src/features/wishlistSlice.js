import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api/axios';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/wishlist')).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    return (await api.post(`/wishlist/${productId}`)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

const slice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: { resetWishlist: (s) => { s.items = []; } },
  extraReducers: (b) => {
    b.addCase(fetchWishlist.fulfilled, (s, a) => { s.items = a.payload; });
    b.addCase(toggleWishlist.fulfilled, (s, a) => { s.items = a.payload; });
  },
});

export const { resetWishlist } = slice.actions;
export default slice.reducer;
