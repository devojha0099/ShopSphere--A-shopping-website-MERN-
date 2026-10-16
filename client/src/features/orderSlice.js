import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api/axios';

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try {
    return (await api.post('/orders', data)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const fetchMyOrders = createAsyncThunk('orders/mine', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/orders/mine')).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

const slice = createSlice({
  name: 'orders',
  initialState: { list: [], status: 'idle', placing: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(placeOrder.pending, (s) => { s.placing = true; s.error = null; })
      .addCase(placeOrder.fulfilled, (s) => { s.placing = false; })
      .addCase(placeOrder.rejected, (s, a) => { s.placing = false; s.error = a.payload; });

    b.addCase(fetchMyOrders.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.status = 'succeeded'; s.list = a.payload; })
      .addCase(fetchMyOrders.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; });
  },
});

export default slice.reducer;
