import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import readImage from '../../components/readImage.js';

const empty = { title: '', category: '', price: '', discount: 0, stock: 10, sizes: 'One size', description: '', hue: 200, image: '' };

// Used for both "new product" (/admin/products/new) and "edit product" (/admin/products/:id).
export default function ProductForm() {
  const { id } = useParams();
  const { notify } = useAuth();
  const nav = useNavigate();
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(empty);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => {
      setCats(data.categories);
      setF((cur) => (cur.category ? cur : { ...cur, category: data.categories[0] || '' }));
    });
    if (id) {
      api.get(`/products/${id}`).then(({ data }) => setF({ ...data, sizes: data.sizes.join(', ') })).catch((e) => setErr(errMsg(e)));
    } else {
      setF(empty);
    }
  }, [id]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setF({ ...f, image: await readImage(file) });
      notify('Image attached');
    } catch (x) {
      notify('That image could not be read');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const body = {
      title: f.title, category: f.category, price: Number(f.price), discount: Number(f.discount) || 0,
      stock: Number(f.stock) || 0, sizes: f.sizes, description: f.description, hue: Number(f.hue), image: f.image,
    };
    try {
      if (id) await api.put(`/products/${id}`, body);
      else await api.post('/products', body);
      notify(id ? 'Product updated' : 'Product added');
      nav('/admin/products');
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card pad frm" onSubmit={submit}>
      <h3 className="full">{id ? 'Edit product' : 'New product'}</h3>
      <div className="field full"><label htmlFor="f-name">Name</label><input id="f-name" required value={f.title} onChange={set('title')} /></div>
      <div className="field">
        <label htmlFor="f-cat">Category</label>
        <select id="f-cat" value={f.category} onChange={set('category')}>{cats.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="field"><label htmlFor="f-price">Price (USD)</label><input id="f-price" type="number" min="0.5" step="0.01" required value={f.price} onChange={set('price')} /></div>
      <div className="field"><label htmlFor="f-disc">Discount %</label><input id="f-disc" type="number" min="0" max="90" step="1" value={f.discount} onChange={set('discount')} /></div>
      <div className="field"><label htmlFor="f-stock">Stock</label><input id="f-stock" type="number" min="0" step="1" value={f.stock} onChange={set('stock')} /></div>
      <div className="field">
        <label htmlFor="f-sizes">Sizes</label>
        <input id="f-sizes" placeholder="S, M, L" value={f.sizes} onChange={set('sizes')} />
        <small>Comma separated. Leave empty for one size.</small>
      </div>
      <div className="field full"><label htmlFor="f-desc">Description</label><textarea id="f-desc" required value={f.description} onChange={set('description')} /></div>
      <div className="field"><label htmlFor="f-hue">Tile color</label><input id="f-hue" type="range" min="0" max="360" value={f.hue} onChange={set('hue')} /></div>
      <div className="field">
        <label htmlFor="f-img">Photo (optional)</label>
        <input id="f-img" type="file" accept="image/*" onChange={pickImage} />
        <small>
          {f.image ? <>Photo attached. <button type="button" className="lnk" style={{ color: 'var(--accent)' }} onClick={() => setF({ ...f, image: '' })}>Remove</button></> : 'Without a photo, an illustration is used.'}
        </small>
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      <div className="full">
        <button className="btn primary" disabled={busy}>{id ? 'Save changes' : 'Add product'}</button>{' '}
        <button type="button" className="btn" onClick={() => nav('/admin/products')}>Cancel</button>
      </div>
    </form>
  );
}
