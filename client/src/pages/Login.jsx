import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../features/authSlice';
import ErrorMessage from '../components/ErrorMessage';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const redirectTo = location.state?.from || '/';

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => { if (user) navigate(redirectTo, { replace: true }); }, [user, navigate, redirectTo]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="auth">
      <form className="card form auth__card" onSubmit={onSubmit}>
        <h1>Log in</h1>
        <ErrorMessage message={error} />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn--primary btn--block" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
        <p className="auth__alt">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
