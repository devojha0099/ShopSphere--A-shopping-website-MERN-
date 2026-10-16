import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cartSlice';
import { toggleWishlist } from '../features/wishlistSlice';
import { formatPrice } from '../utils/format';
import Stars from './Stars';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const wished = useSelector((s) => s.wishlist.items.some((p) => p._id === product._id));
  const soldOut = product.stock === 0;

  const onWish = () => {
    if (!user) return navigate('/login');
    dispatch(toggleWishlist(product._id));
  };

  const onAdd = () =>
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      stock: product.stock,
    }));

  return (
    <article className="product-card">
      <div className="product-card__media">
        <Link to={`/products/${product._id}`}>
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        </Link>
        <button
          className={`wish-btn ${wished ? 'wish-btn--on' : ''}`}
          onClick={onWish}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
        >
          {wished ? '♥' : '♡'}
        </button>
        {soldOut && <span className="tag tag--out">Out of stock</span>}
      </div>
      <div className="product-card__body">
        <p className="product-card__cat">{product.category}</p>
        <h3 className="product-card__title">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>
        <Stars value={product.rating} count={product.numReviews} />
        <div className="product-card__footer">
          <strong>{formatPrice(product.price)}</strong>
          <button className="btn btn--outline btn--sm" disabled={soldOut} onClick={onAdd}>
            {soldOut ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
