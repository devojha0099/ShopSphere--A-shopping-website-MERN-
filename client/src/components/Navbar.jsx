import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { selectCartCount } from '../features/cartSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const cartCount = useSelector(selectCartCount);
  const wishCount = useSelector((s) => s.wishlist.items.length);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/products?search=${encodeURIComponent(query.trim())}` : '/products');
  };

  const onLogout = async () => {
    await dispatch(logoutUser());
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">Shop<span>Sphere</span> by Dev</Link>
        
        <form className="navbar__search" onSubmit={onSearch} role="search">
          <input
            type="search"
            placeholder="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" className="btn btn--primary btn--sm">Search</button>
        </form>

        <nav className="navbar__links">
          <NavLink to="/products">Shop</NavLink>
          <NavLink to="/wishlist" className="navbar__icon">
            Wishlist 
          </NavLink>
          <NavLink to="/cart" className="navbar__icon">
            Cart 
          </NavLink>

          {user ? (
            <div className="dropdown">
              <button className="dropdown__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
                {user.name.split(' ')[0]}
              </button>
              {open && (
                <div className="dropdown__menu" onClick={() => setOpen(false)}>
                  <Link to="/orders">My orders</Link>
                  {user.role === 'admin' && <Link to="/admin">Admin dashboard</Link>}
                  <button onClick={onLogout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn--primary btn--sm">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
