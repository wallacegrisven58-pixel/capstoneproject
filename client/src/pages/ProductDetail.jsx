import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductArt from '../components/ProductArt.jsx';
import ProductCard, { Price, Stars } from '../components/ProductCard.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { user, refreshCart, notify } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    setP(null);
    setQty(1);
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        setP(data);
        setSize(data.sizes[0]);
        try {
          const v = JSON.parse(localStorage.getItem('shopez_viewed') || '[]');
          localStorage.setItem('shopez_viewed', JSON.stringify([...v, data.category].slice(-20)));
        } catch (e) { /* storage unavailable */ }
        return api.get('/products', { params: { category: data.category } });
      })
      .then(({ data }) => setRelated(data.filter((x) => x._id !== id).slice(0, 4)))
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <div className="card empty"><h2>Product not found</h2><Link className="btn primary" to="/">Back to shop</Link></div>;
  if (!p) return <p className="muted">Loading…</p>;

  const out = p.stock <= 0;
  const guard = () => {
    if (!user) {
      notify('Log in to continue');
      nav('/auth', { state: { from: `/product/${id}` } });
      return false;
    }
    if (user.role === 'admin') {
      notify('Log in with a customer account to shop');
      return false;
    }
    return true;
  };
  const add = async () => {
    if (!guard()) return;
    try {
      await api.post('/cart', { productId: p._id, quantity: qty, size });
      await refreshCart();
      notify('Added to your cart');
    } catch (e) {
      notify(errMsg(e));
    }
  };
  const buy = () => {
    if (!guard()) return;
    nav('/checkout', { state: { buyNow: { productId: p._id, quantity: qty, size } } });
  };
  const postReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/products/${id}/reviews`, review);
      setP(data);
      setReview({ rating: 5, comment: '' });
      notify('Review posted');
    } catch (err) {
      notify(errMsg(err));
    }
  };

  return (
    <>
      <div><Link className="btn sm" to="/">← All accessories</Link></div>
      <section className="pdp">
        <ProductArt product={p} />
        <div className="info">
          <div className="cat">{p.category}</div>
          <h1>{p.title}</h1>
          <div><Stars value={p.rating} count={p.reviews.length} /></div>
          <div>
            <Price p={p} />{' '}
            {p.discount > 0 && <span className="badge" style={{ position: 'static', display: 'inline-block' }}>-{p.discount}%</span>}
          </div>
          {out ? <span className="stock out">Sold out</span> : p.stock <= 5 ? <span className="stock low">Only {p.stock} left</span> : <span className="stock in">In stock</span>}
          <p>{p.description}</p>
          {p.sizes.length > 1 && (
            <div>
              <div className="lbl">Size</div>
              <div className="opts2">
                {p.sizes.map((s) => <button key={s} className={'sz' + (size === s ? ' on' : '')} onClick={() => setSize(s)}>{s}</button>)}
              </div>
            </div>
          )}
          {!out && (
            <div>
              <div className="lbl">Quantity</div>
              <div className="qty">
                <button aria-label="Fewer" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span>{qty}</span>
                <button aria-label="More" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
              </div>
            </div>
          )}
          <div className="acts">
            <button className="btn primary" onClick={buy} disabled={out}>Shop Now</button>
            <button className="btn" onClick={add} disabled={out}>Add to cart</button>
          </div>
          <p className="muted sm">Free shipping on orders from $75, otherwise $6.</p>
        </div>
      </section>

      <section className="sec">
        <h2>Customer reviews</h2>
        <div className="card pad">
          {p.reviews.length === 0 && <p className="muted">No reviews yet.</p>}
          {[...p.reviews].reverse().map((r, i) => (
            <div className="review" key={r._id || i}>
              <div><Stars value={r.rating} /> <b>{r.name}</b></div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
        <div className="card pad">
          <h3 style={{ marginBottom: 12 }}>Write a review</h3>
          {user ? (
            <form className="frm" onSubmit={postReview}>
              <div className="field">
                <label htmlFor="rv-stars">Your rating</label>
                <select id="rv-stars" value={review.rating} onChange={(e) => setReview({ ...review, rating: +e.target.value })}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="field full">
                <label htmlFor="rv-text">Your review</label>
                <textarea id="rv-text" maxLength={400} required value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
              </div>
              <div className="full"><button className="btn">Post review</button></div>
            </form>
          ) : (
            <Link className="btn" to="/auth" state={{ from: `/product/${id}` }}>Log in to write a review</Link>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="sec">
          <h2>More {p.category.toLowerCase()}</h2>
          <div className="grid">{related.map((x) => <ProductCard key={x._id} p={x} />)}</div>
        </section>
      )}
    </>
  );
}
