import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from '../features/orderSlice';
import { clearCart, selectCartTotal } from '../features/cartSlice';
import api, { errMsg } from '../api/axios';
import { formatPrice } from '../utils/format';
import { FREE_SHIPPING_ABOVE, SHIPPING_FEE } from './Cart';
import ErrorMessage from '../components/ErrorMessage';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const subtotal = useSelector(selectCartTotal);
  const user = useSelector((s) => s.auth.user);
  const placing = useSelector((s) => s.orders.placing);

  const [form, setForm] = useState({ fullName: user?.name || '', phone: '', address: '', city: '', postalCode: '' });
  const [method, setMethod] = useState('COD');
  const [error, setError] = useState('');

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const finish = (orderId) => {
    dispatch(clearCart());
    navigate('/orders', { state: { placed: orderId } });
  };

  const payOnline = async (order) => {
    if (!(await loadRazorpay())) throw new Error('Could not load Razorpay. Check your connection.');
    const { data } = await api.post(`/orders/${order._id}/razorpay`);

    await new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: 'ShopSphere',
        description: 'Test payment',
        prefill: { name: form.fullName, email: user.email, contact: form.phone },
        theme: { color: '#4338ca' },
        handler: async (response) => {
          try {
            await api.post(`/orders/${order._id}/verify`, response);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        modal: { ondismiss: () => reject(new Error('Payment cancelled. Your order is saved as unpaid.')) },
      });
      rzp.open();
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await dispatch(
      placeOrder({
        items: items.map((i) => ({ product: i.product, qty: i.qty })),
        shippingAddress: form,
        paymentMethod: method,
      })
    );
    if (placeOrder.rejected.match(result)) return setError(result.payload);

    const order = result.payload;
    try {
      if (method === 'RAZORPAY') await payOnline(order);
      finish(order._id);
    } catch (err) {
      // The order exists (stock is reserved), so clear the cart and send the user to their orders
      setError(errMsg(err));
      dispatch(clearCart());
      setTimeout(() => navigate('/orders'), 2500);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Checkout</h1>
      <div className="cart">
        <form className="card form" onSubmit={onSubmit}>
          <h2>Shipping address</h2>
          <ErrorMessage message={error} />
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" required value={form.fullName} onChange={onChange} />
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" required value={form.phone} onChange={onChange} />
          <label htmlFor="address">Address</label>
          <input id="address" name="address" required value={form.address} onChange={onChange} />
          <div className="form__row">
            <div>
              <label htmlFor="city">City</label>
              <input id="city" name="city" required value={form.city} onChange={onChange} />
            </div>
            <div>
              <label htmlFor="postalCode">Postal code</label>
              <input id="postalCode" name="postalCode" required value={form.postalCode} onChange={onChange} />
            </div>
          </div>

          <h2>Payment</h2>
          <label className="radio"><input type="radio" checked={method === 'COD'} onChange={() => setMethod('COD')} /> Cash on delivery</label>
          <label className="radio"><input type="radio" checked={method === 'RAZORPAY'} onChange={() => setMethod('RAZORPAY')} /> Pay online (Razorpay test mode)</label>

          <button className="btn btn--primary btn--block" disabled={placing}>
            {placing ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="summary">
          <h2>Your items</h2>
          {items.map((i) => (
            <div key={i.product} className="summary__row"><span>{i.name} × {i.qty}</span><span>{formatPrice(i.price * i.qty)}</span></div>
          ))}
          <div className="summary__row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
          <div className="summary__row summary__row--total"><span>Total</span><span>{formatPrice(total)}</span></div>
        </aside>
      </div>
    </div>
  );
}
