import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../features/productSlice';
import { addToCart } from '../features/cartSlice';
import { toggleWishlist } from '../features/wishlistSlice';
import api, { errMsg } from '../api/axios';
import { formatPrice, formatDate } from '../utils/format';
import Stars from '../components/Stars';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: product, status, error } = useSelector((s) => s.products);
  const user = useSelector((s) => s.auth.user);
  const wished = useSelector((s) => s.wishlist.items.some((p) => p._id === id));

  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

  const loadReviews = () => api.get(`/products/${id}/reviews`).then((r) => setReviews(r.data)).catch(() => {});

  useEffect(() => {
    dispatch(fetchProduct(id));
    loadReviews();
    setImg(0);
    setQty(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch]);

  if (status === 'loading' || (!product && !error)) return <Loader />;
  if (error || !product) return <div className="container"><ErrorMessage message={error || 'Product not found'} /></div>;

  const soldOut = product.stock === 0;

  const onAdd = () => {
    dispatch(addToCart({ product: product._id, name: product.name, price: product.price, image: product.images[0], stock: product.stock, qty }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const onWish = () => (user ? dispatch(toggleWishlist(product._id)) : navigate('/login'));

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/reviews`, form);
      setReviewMsg({ type: 'success', text: 'Thanks, your review is saved.' });
      setForm({ rating: 5, comment: '' });
      loadReviews();
      dispatch(fetchProduct(id)); // refresh average rating
    } catch (err) {
      setReviewMsg({ type: 'error', text: errMsg(err) });
    }
  };

  return (
    <div className="container details">
      <div className="details__top">
        <div className="gallery">
          <img className="gallery__main" src={product.images[img]} alt={product.name} />
          <div className="gallery__thumbs">
            {product.images.map((src, i) => (
              <button key={src} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Show image ${i + 1}`}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="details__info">
          <p className="product-card__cat">{product.category}</p>
          <h1>{product.name}</h1>
          <Stars value={product.rating} count={product.numReviews} />
          <p className="details__price">{formatPrice(product.price)}</p>
          <p className={soldOut ? 'stock stock--out' : product.stock <= 5 ? 'stock stock--low' : 'stock'}>
            {soldOut ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
          </p>
          <p className="details__desc">{product.description}</p>

          {!soldOut && (
            <div className="qty">
              <label htmlFor="qty">Quantity</label>
              <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          <div className="details__actions">
            <button className="btn btn--primary btn--lg" disabled={soldOut} onClick={onAdd}>
              {added ? 'Added to cart' : 'Add to cart'}
            </button>
            <button className="btn btn--outline btn--lg" onClick={onWish}>
              {wished ? '♥ In wishlist' : '♡ Add to wishlist'}
            </button>
          </div>
          {added && <Link to="/cart" className="link-btn">Go to cart</Link>}
        </div>
      </div>

      <section className="reviews">
        <h2>Reviews</h2>
        {reviews.length === 0 && <p className="empty">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="review">
            <div className="review__head">
              <strong>{r.user?.name || 'Customer'}</strong>
              <Stars value={r.rating} />
              <small>{formatDate(r.createdAt)}</small>
            </div>
            <p>{r.comment}</p>
          </div>
        ))}

        {user ? (
          <form className="review-form" onSubmit={submitReview}>
            <h3>Write a review</h3>
            <p className="hint">Only customers who bought this product can review it.</p>
            {reviewMsg.text && <p className={`alert alert--${reviewMsg.type}`}>{reviewMsg.text}</p>}
            <label htmlFor="rate">Rating</label>
            <select id="rate" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
            </select>
            <label htmlFor="comment">Your review</label>
            <textarea id="comment" rows="3" maxLength="500" required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            <button className="btn btn--primary" type="submit">Post review</button>
          </form>
        ) : (
          <p><Link to="/login" className="link-btn">Log in</Link> to write a review.</p>
        )}
      </section>
    </div>
  );
}
