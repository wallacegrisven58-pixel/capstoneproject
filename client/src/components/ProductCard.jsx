import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductArt from './ProductArt.jsx';

export const Stars = ({ value, count }) => {
  const f = Math.round(value || 0);
  return (
    <span>
      <span className="stars" role="img" aria-label={`${(value || 0).toFixed(1)} out of 5`}>{'★'.repeat(f)}{'☆'.repeat(5 - f)}</span>
      {count != null && <span className="muted sm"> ({count})</span>}
    </span>
  );
};

export const Price = ({ p }) =>
  p.discount ? (
    <>
      <span className="price">{money(p.finalPrice)}</span> <s className="sm num">{money(p.price)}</s>
    </>
  ) : (
    <span className="price">{money(p.price)}</span>
  );

export default function ProductCard({ p }) {
  const { user, refreshCart, notify } = useAuth();
  const nav = useNavigate();
  const out = p.stock <= 0;

  const needLogin = () => {
    notify('Log in to continue');
    nav('/auth', { state: { from: `/product/${p._id}` } });
  };
  const add = async () => {
    if (!user) return needLogin();
    if (user.role === 'admin') return notify('Log in with a customer account to shop');
    try {
      await api.post('/cart', { productId: p._id, quantity: 1, size: p.sizes[0] });
      await refreshCart();
      notify('Added to your cart');
    } catch (e) {
      notify(errMsg(e));
    }
  };
  const buy = () => {
    if (!user) return needLogin();
    if (user.role === 'admin') return notify('Log in with a customer account to shop');
    nav('/checkout', { state: { buyNow: { productId: p._id, quantity: 1, size: p.sizes[0] } } });
  };

  return (
    <article className="pc card">
      <Link to={`/product/${p._id}`} className="tilebtn" aria-label={`View ${p.title}`}>
        <ProductArt product={p} />
        {p.discount > 0 && <span className="badge">-{p.discount}%</span>}
        {out && <span className="badge out">Sold out</span>}
      </Link>
      <div className="pcb">
        <div className="cat">{p.category}</div>
        <h3><Link className="lnk" to={`/product/${p._id}`}>{p.title}</Link></h3>
        <div><Stars value={p.rating} count={p.reviews.length} /></div>
        <div><Price p={p} /></div>
        <div className="acts">
          <button className="btn primary sm" onClick={buy} disabled={out}>Shop Now</button>
          <button className="btn sm" onClick={add} disabled={out}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}
