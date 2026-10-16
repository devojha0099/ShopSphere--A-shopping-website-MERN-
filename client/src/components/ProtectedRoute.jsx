import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, initialized } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!initialized) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
