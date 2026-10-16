import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeatured } from '../features/productSlice';
import api from '../api/axios';
import { useState } from 'react';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const dispatch = useDispatch();
  const featured = useSelector((s) => s.products.featured);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchFeatured());
    api.get('/products/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, [dispatch]);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <h1>Everyday things, picked with care.</h1>
            <p>Electronics, fashion, home and sports essentials. Free shipping on orders above ₹999.</p>
            <Link to="/products" className="btn btn--primary btn--lg">Browse all products</Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="section__title">Shop by category</h2>
        <div className="category-strip">
          {categories.map((c) => (
            <Link key={c} to={`/products?category=${encodeURIComponent(c)}`} className="category-chip">{c}</Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="section__title">Featured products</h2>
        <div className="product-grid">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </>
  );
}
