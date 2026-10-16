import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, setQty, selectCartTotal } from '../features/cartSlice';
import { formatPrice } from '../utils/format';

export const FREE_SHIPPING_ABOVE = 999;
export const SHIPPING_FEE = 49;

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const subtotal = useSelector(selectCartTotal);
  const shipping = subtotal >= FREE_SHIPPING_ABOVE || subtotal === 0 ? 0 : SHIPPING_FEE;

  if (items.length === 0) {
    return (
      <div className="container empty-page">
        <h1>Your cart is empty</h1>
        <p>Add something you like and it will show up here.</p>
        <Link to="/products" className="btn btn--primary">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Shopping cart</h1>
      <div className="cart">
        <div className="cart__items">
          {items.map((i) => (
            <div key={i.product} className="cart-item">
              <img src={i.image} alt={i.name} />
              <div className="cart-item__info">
                <Link to={`/products/${i.product}`}>{i.name}</Link>
                <p>{formatPrice(i.price)}</p>
                <button className="link-btn link-btn--danger" onClick={() => dispatch(removeFromCart(i.product))}>Remove</button>
              </div>
              <div className="stepper">
                <button onClick={() => dispatch(setQty({ product: i.product, qty: i.qty - 1 }))} disabled={i.qty <= 1} aria-label="Decrease quantity">−</button>
                <span>{i.qty}</span>
                <button onClick={() => dispatch(setQty({ product: i.product, qty: i.qty + 1 }))} disabled={i.qty >= i.stock} aria-label="Increase quantity">+</button>
              </div>
              <strong className="cart-item__total">{formatPrice(i.price * i.qty)}</strong>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h2>Order summary</h2>
          <div className="summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary__row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
          <div className="summary__row summary__row--total"><span>Total</span><span>{formatPrice(subtotal + shipping)}</span></div>
          <button className="btn btn--primary btn--block" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
        </aside>
      </div>
    </div>
  );
}
