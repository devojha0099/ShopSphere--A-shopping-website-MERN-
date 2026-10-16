import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const items = useSelector((s) => s.wishlist.items);
  return (
    <div className="container">
      <h1 className="page-title">Wishlist</h1>
      {items.length === 0 ? (
        <div className="empty-page">
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/products" className="btn btn--primary">Browse products</Link>
        </div>
      ) : (
        <div className="product-grid">{items.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}
    </div>
  );
}
