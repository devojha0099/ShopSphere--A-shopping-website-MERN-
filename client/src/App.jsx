import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './features/authSlice';
import { fetchWishlist, resetWishlist } from './features/wishlistSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  // Restore the session once when the app loads
  useEffect(() => { dispatch(fetchMe()); }, [dispatch]);

  // Load / clear the wishlist whenever the user logs in or out
  useEffect(() => {
    if (user) dispatch(fetchWishlist());
    else dispatch(resetWishlist());
  }, [user, dispatch]);

 

  return (
    <Routes>
      {/* for admin only */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Route>

      {/* Customer area */}
      <Route
        path="*"
        element={
          <>
            <Navbar />
            <main className="page">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </>
        }
      />
    </Routes>
  );
}
