import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api/axios';

export const fetchProducts = createAsyncThunk('products/list', async (params, { rejectWithValue }) => {
  try {
    return (await api.get('/products', { params })).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/products', { params: { featured: true, limit: 8 } })).data.products;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const fetchProduct = createAsyncThunk('products/one', async (id, { rejectWithValue }) => {
  try {
    return (await api.get(`/products/${id}`)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

const slice = createSlice({
  name: 'products',
  initialState: {
    items: [], page: 1, pages: 1, total: 0,
    featured: [], current: null,
    status: 'idle', error: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items = a.payload.products;
        s.page = a.payload.page;
        s.pages = a.payload.pages;
        s.total = a.payload.total;
      })
      .addCase(fetchProducts.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; });

    b.addCase(fetchFeatured.fulfilled, (s, a) => { s.featured = a.payload; });

    b.addCase(fetchProduct.pending, (s) => { s.status = 'loading'; s.current = null; s.error = null; })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.status = 'succeeded'; s.current = a.payload; })
      .addCase(fetchProduct.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; });
  },
});

export default slice.reducer;
