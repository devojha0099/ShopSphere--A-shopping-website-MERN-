import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/productSlice';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function Products() {
  const dispatch = useDispatch();
  const { items, page, pages, total, status, error } = useSelector((s) => s.products);
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState({ min: params.get('minPrice') || '', max: params.get('maxPrice') || '' });

  useEffect(() => {
    api.get('/products/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    dispatch(fetchProducts(Object.fromEntries(params)));
  }, [params, dispatch]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page'); // any filter change goes back to page 1
    setParams(next);
  };

  const applyPrice = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    price.min ? next.set('minPrice', price.min) : next.delete('minPrice');
    price.max ? next.set('maxPrice', price.max) : next.delete('maxPrice');
    next.delete('page');
    setParams(next);
  };

  const clearAll = () => {
    setPrice({ min: '', max: '' });
    setParams({});
  };

  return (
    <div className="container shop">
      <aside className="filters">
        <div className="filters__head">
          <h2>Filters</h2>
          <button className="link-btn" onClick={clearAll}>Clear all</button>
        </div>

        <div className="filters__group">
          <label htmlFor="category">Category</label>
          <select id="category" value={params.get('category') || ''} onChange={(e) => setParam('category', e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <form className="filters__group" onSubmit={applyPrice}>
          <label>Price (₹)</label>
          <div className="filters__row">
            <input type="number" min="0" placeholder="Min" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} />
            <input type="number" min="0" placeholder="Max" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} />
          </div>
          <button className="btn btn--outline btn--sm" type="submit">Apply</button>
        </form>

        <div className="filters__group">
          <label htmlFor="rating">Minimum rating</label>
          <select id="rating" value={params.get('rating') || ''} onChange={(e) => setParam('rating', e.target.value)}>
            <option value="">Any</option>
            <option value="4">4★ and above</option>
            <option value="3">3★ and above</option>
            <option value="2">2★ and above</option>
          </select>
        </div>
      </aside>

      <section className="shop__results">
        <div className="shop__bar">
          <p>
            {params.get('search') && <>Results for “{params.get('search')}”: </>}
            <strong>{total}</strong> products
          </p>
          <select value={params.get('sort') || 'newest'} onChange={(e) => setParam('sort', e.target.value)} aria-label="Sort products">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        <ErrorMessage message={error} />
        {status === 'loading' ? (
          <Loader />
        ) : items.length === 0 ? (
          <p className="empty">No products match these filters. Try clearing some.</p>
        ) : (
          <div className="product-grid">
            {items.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        <Pagination page={page} pages={pages} onChange={(n) => setParam('page', String(n))} />
      </section>
    </div>
  );
}
