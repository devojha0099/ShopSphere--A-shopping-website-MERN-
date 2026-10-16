import { NavLink, Outlet, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <Link to="/admin" className="admin__logo">Shop<span>Sphere</span></Link>
        <nav>
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
        </nav>
        <Link to="/" className="admin__back">← Back to store</Link>
      </aside>
      <section className="admin__content">
        <Outlet />
      </section>
    </div>
  );
}
