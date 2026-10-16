import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api/axios';
import { formatPrice, formatDate } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

const STATUSES = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  const changeStatus = async (id, orderStatus) => {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { orderStatus });
      setOrders((list) => list.map((o) => (o._id === id ? { ...o, ...data } : o)));
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (!orders && !error) return <Loader />;

  return (
    <>
      <h1 className="admin__title">Orders</h1>
      <ErrorMessage message={error} />
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-6).toUpperCase()}</td>
                <td>{o.user?.name || 'Deleted user'}<br /><small>{o.shippingAddress.city}</small></td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                <td>{formatPrice(o.total)}</td>
                <td>{o.paymentMethod === 'COD' ? 'COD' : 'Online'} · {o.paymentStatus}</td>
                <td>
                  <select value={o.orderStatus} onChange={(e) => changeStatus(o._id, e.target.value)} aria-label="Order status">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
