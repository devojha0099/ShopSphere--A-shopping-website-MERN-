import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../features/orderSlice';
import { formatPrice, formatDate } from '../utils/format';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const STEPS = ['Pending', 'Shipped', 'Delivered'];

export default function Orders() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { list, status, error } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (status === 'loading' && list.length === 0) return <Loader />;

  return (
    <div className="container">
      <h1 className="page-title">My orders</h1>
      {location.state?.placed && <p className="alert alert--success">Order placed. Thank you for shopping with us.</p>}
      <ErrorMessage message={error} />
      {list.length === 0 && (
        <div className="empty-page">
          <p>You have not placed any orders yet.</p>
          <Link to="/products" className="btn btn--primary">Start shopping</Link>
        </div>
      )}

      {list.map((o) => (
        <article key={o._id} className="order card">
          <header className="order__head">
            <div>
              <strong>Order #{o._id.slice(-6).toUpperCase()}</strong>
              <small>{formatDate(o.createdAt)}</small>
            </div>
            <span className={`status status--${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
          </header>

          {o.orderStatus !== 'Cancelled' && (
            <ol className="tracker">
              {STEPS.map((s, i) => (
                <li key={s} className={i <= STEPS.indexOf(o.orderStatus) ? 'done' : ''}>{s}</li>
              ))}
            </ol>
          )}

          {o.items.map((i) => (
            <div key={i.product} className="order__item">
              <img src={i.image} alt="" />
              <Link to={`/products/${i.product}`}>{i.name}</Link>
              <span>× {i.qty}</span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </div>
          ))}

          <footer className="order__foot">
            <span>{o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online payment'} · {o.paymentStatus}</span>
            <strong>Total {formatPrice(o.total)}</strong>
          </footer>
        </article>
      ))}
    </div>
  );
}
