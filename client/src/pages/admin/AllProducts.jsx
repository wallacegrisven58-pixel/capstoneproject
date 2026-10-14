import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, money } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ProductArt from '../../components/ProductArt.jsx';

export default function AllProducts() {
  const { notify } = useAuth();
  const [products, setProducts] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => {
    api.get('/products').then(({ data }) => setProducts(data)).catch((e) => notify(errMsg(e)));
  }, [notify]);
  useEffect(load, [load]);

  const del = async (p) => {
    if (confirm !== p._id) return setConfirm(p._id);
    try {
      await api.delete(`/products/${p._id}`);
      setConfirm(null);
      notify('Product deleted');
      load();
    } catch (e) {
      notify(errMsg(e));
    }
  };

  if (!products) return <p className="muted">Loading…</p>;
  return (
    <div className="card tbl">
      <table>
        <thead>
          <tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Discount</th><th>Stock</th><th></th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td style={{ width: 60 }}><ProductArt product={p} /></td>
              <td><b>{p.title}</b></td>
              <td>{p.category}</td>
              <td className="num">{money(p.price)}</td>
              <td className="num">{p.discount ? `${p.discount}%` : '—'}</td>
              <td className="num">{p.stock}</td>
              <td>
                <Link className="btn sm" to={`/admin/products/${p._id}`}>Edit</Link>{' '}
                <button className="btn sm danger" onClick={() => del(p)}>{confirm === p._id ? 'Confirm delete' : 'Delete'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
