import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductArt from '../components/ProductArt.jsx';

export function summary(lines) {
  const sub = Math.round(lines.reduce((a, l) => a + l.product.finalPrice * l.quantity, 0) * 100) / 100;
  const ship = sub === 0 || sub >= 75 ? 0 : 6;
  return { sub, ship, total: Math.round((sub + ship) * 100) / 100 };
}

export default function Cart() {
  const { refreshCart, notify } = useAuth();
  const nav = useNavigate();
  const [lines, setLines] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/cart');
      setLines(data);
      refreshCart();
    } catch (e) {
      notify(errMsg(e));
    }
  }, [refreshCart, notify]);
  useEffect(() => { load(); }, [load]);

  const change = async (l, d) => {
    const quantity = Math.max(1, l.quantity + d);
    try {
      await api.put(`/cart/${l._id}`, { quantity });
      load();
    } catch (e) {
      notify(errMsg(e));
    }
  };
  const remove = async (l) => {
    await api.delete(`/cart/${l._id}`);
    load();
  };

  if (!lines) return <p className="muted">Loading…</p>;
  if (!lines.length)
    return (
      <div className="card empty">
        <h2>Your cart is empty</h2>
        <p className="muted">Add something you like and it will wait here.</p>
        <Link className="btn primary" to="/">Browse the shop</Link>
      </div>
    );
  const t = summary(lines);

  return (
    <>
      <h2>Your cart</h2>
      <div className="two wide">
        <div className="card pad">
          <div className="rows">
            {lines.map((l) => (
              <div className="row" key={l._id}>
                <ProductArt product={l.product} />
                <div>
                  <div className="nm"><Link className="lnk" to={`/product/${l.product._id}`}>{l.product.title}</Link></div>
                  <div className="muted sm">{l.product.category}{l.size && l.size !== 'One size' ? ` · Size ${l.size}` : ''} · {money(l.product.finalPrice)} each</div>
                </div>
                <div className="end">
                  <b className="num">{money(l.product.finalPrice * l.quantity)}</b>
                  <div className="qty">
                    <button aria-label="Fewer" onClick={() => change(l, -1)}>−</button>
                    <span>{l.quantity}</span>
                    <button aria-label="More" onClick={() => change(l, 1)}>+</button>
                  </div>
                  <button className="lnk sm muted" onClick={() => remove(l)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="card pad sum">
          <h3>Order summary</h3>
          <div className="ln"><span>Subtotal</span><span className="num">{money(t.sub)}</span></div>
          <div className="ln"><span>Shipping</span><span className="num">{t.ship ? money(t.ship) : 'Free'}</span></div>
          <div className="ln tot"><span>Total</span><span className="num">{money(t.total)}</span></div>
          {t.ship > 0 && <p className="muted sm">Add {money(75 - t.sub)} more for free shipping.</p>}
          <button className="btn primary block" onClick={() => nav('/checkout')}>Checkout</button>
        </aside>
      </div>
    </>
  );
}
