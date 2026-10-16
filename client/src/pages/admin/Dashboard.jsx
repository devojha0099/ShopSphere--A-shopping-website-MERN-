import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api, { errMsg } from '../../api/axios';
import { formatPrice, formatDate } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <ErrorMessage message={error} />;
  if (!stats) return <Loader />;

  const cards = [
    { label: 'Revenue', value: formatPrice(stats.revenue) },
    { label: 'Orders', value: stats.orders },
    { label: 'Customers', value: stats.users },
    { label: 'Low stock items', value: stats.lowStock, warn: stats.lowStock > 0 },
  ];

  return (
    <>
      <h1 className="admin__title">Dashboard</h1>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className={`stat ${c.warn ? 'stat--warn' : ''}`}>
            <p>{c.label}</p>
            <strong>{c.value}</strong>
          </div>
        ))}
      </div>

      <div className="card chart-card">
        <h2>Sales in the last 7 days</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.salesByDay}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(v) => `₹${v}`} width={70} />
            <Tooltip formatter={(v) => formatPrice(v)} />
            <Bar dataKey="sales" fill="#4338ca" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="card__head">
          <h2>Recent orders</h2>
          <Link to="/admin/orders" className="link-btn">View all</Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.user?.name || 'Deleted user'}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td><span className={`status status--${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
