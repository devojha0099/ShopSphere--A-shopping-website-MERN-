import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../features/authSlice';
import ErrorMessage from '../components/ErrorMessage';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(form));
  };

  return (
    <div className="auth">
      <form className="card form auth__card" onSubmit={onSubmit}>
        <h1>Create account</h1>
        <ErrorMessage message={error} />
        <label htmlFor="name">Name</label>
        <input id="name" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label htmlFor="password">Password (min 6 characters)</label>
        <input id="password" type="password" minLength="6" required autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn--primary btn--block" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
        <p className="auth__alt">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
