import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import productReducer from '../features/productSlice';
import cartReducer from '../features/cartSlice';
import wishlistReducer from '../features/wishlistSlice';
import orderReducer from '../features/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: orderReducer,
  },
});

// save on local storage
store.subscribe(() => {
  try {
    localStorage.setItem('shopsphere_cart', JSON.stringify(store.getState().cart.items));
  } catch {

  }
});
