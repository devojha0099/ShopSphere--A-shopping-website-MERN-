import { createSlice } from '@reduxjs/toolkit';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem('shopsphere_cart')) || [];
  } catch {
    return [];
  }
};

const slice = createSlice({
  name: 'cart',
  initialState: { items: load() },
  reducers: {
    addToCart: (s, a) => {
      const { product, qty = 1 } = a.payload;
      const found = s.items.find((i) => i.product === product);
      if (found) found.qty = Math.min(found.qty + qty, found.stock);
      else s.items.push({ ...a.payload, qty: Math.min(qty, a.payload.stock) });
    },
    setQty: (s, a) => {
      const item = s.items.find((i) => i.product === a.payload.product);
      if (item) item.qty = Math.max(1, Math.min(a.payload.qty, item.stock));
    },
    removeFromCart: (s, a) => { s.items = s.items.filter((i) => i.product !== a.payload); },
    clearCart: (s) => { s.items = []; },
  },
});

export const { addToCart, setQty, removeFromCart, clearCart } = slice.actions;

export const selectCartCount = (st) => st.cart.items.reduce((n, i) => n + i.qty, 0);
export const selectCartTotal = (st) => st.cart.items.reduce((n, i) => n + i.qty * i.price, 0);

export default slice.reducer;
