import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api/axios';
import { formatPrice } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

const EMPTY = { name: '', description: '', price: '', category: '', stock: '', featured: false, images: [] };

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = form open
  const [form, setForm] = useState(EMPTY);
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () =>
    api.get('/products', { params: { limit: 50 } }).then((r) => setProducts(r.data.products)).catch((e) => setError(errMsg(e)));

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing({}); setFormError(''); };
  const openEdit = (p) => { setForm({ ...p }); setEditing(p); setFormError(''); };
  const close = () => setEditing(null);
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    setForm({ ...form, images: [...form.images, imageUrl.trim()] });
    setImageUrl('');
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await api.post('/products/upload', data);
      setForm((f) => ({ ...f, images: [...f.images, res.data.url] }));
    } catch (err) {
      setFormError(errMsg(err));
    }
    e.target.value = '';
  };

  const removeImage = (i) => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });

  const save = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) return setFormError('Add at least one image');
    setSaving(true);
    setFormError('');
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editing._id) await api.put(`/products/${editing._id}`, payload);
      else await api.post('/products', payload);
      close();
      load();
    } catch (err) {
      setFormError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (!products && !error) return <Loader />;

  return (
    <>
      <div className="admin__bar">
        <h1 className="admin__title">Products</h1>
        <button className="btn btn--primary" onClick={openNew}>Add product</button>
      </div>
      <ErrorMessage message={error} />

      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p._id}>
                <td className="table__product"><img src={p.images[0]} alt="" />{p.name}</td>
                <td>{p.category}</td>
                <td>{formatPrice(p.price)}</td>
                <td className={p.stock <= 5 ? 'text-warn' : ''}>{p.stock}</td>
                <td className="table__actions">
                  <button className="link-btn" onClick={() => openEdit(p)}>Edit</button>
                  <button className="link-btn link-btn--danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Product form">
          <form className="modal__box form" onSubmit={save}>
            <h2>{editing._id ? 'Edit product' : 'New product'}</h2>
            <ErrorMessage message={formError} />

            <label htmlFor="name">Name</label>
            <input id="name" name="name" required value={form.name} onChange={onChange} />
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="3" required value={form.description} onChange={onChange} />
            <div className="form__row">
              <div><label htmlFor="price">Price (₹)</label><input id="price" name="price" type="number" min="0" required value={form.price} onChange={onChange} /></div>
              <div><label htmlFor="stock">Stock</label><input id="stock" name="stock" type="number" min="0" required value={form.stock} onChange={onChange} /></div>
            </div>
            <label htmlFor="category">Category</label>
            <input id="category" name="category" required value={form.category} onChange={onChange} />
            <label className="radio"><input type="checkbox" name="featured" checked={form.featured} onChange={onChange} /> Show on home page</label>

            <label>Images</label>
            <div className="thumbs">
              {form.images.map((src, i) => (
                <div key={src + i} className="thumbs__item">
                  <img src={src} alt="" />
                  <button type="button" onClick={() => removeImage(i)} aria-label="Remove image">×</button>
                </div>
              ))}
            </div>
            <div className="form__row form__row--inline">
              <input placeholder="Paste image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              <button type="button" className="btn btn--outline" onClick={addImageUrl}>Add URL</button>
            </div>
            <input type="file" accept="image/*" onChange={uploadFile} />
            <p className="hint">File upload needs Cloudinary keys on the server. Pasting an image URL always works.</p>

            <div className="modal__actions">
              <button type="button" className="btn btn--outline" onClick={close}>Cancel</button>
              <button className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
