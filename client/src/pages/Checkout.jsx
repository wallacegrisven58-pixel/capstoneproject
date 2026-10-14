import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { errMsg, money, PAY } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { summary } from './Cart.jsx';

// The "order details" page. Opened from the cart (all lines) or from "Shop Now" (one product).
export default function Checkout() {
  const { user, refreshCart, notify } = useAuth();
  const nav = useNavigate();
  const buyNow = useLocation().state?.buyNow;
  const [lines, setLines] = useState(null);
  const [f, setF] = useState({ name: user?.username || '', mobile: '', address: '', city: '', pincode: '', notes: '', paymentMethod: 'cod' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (buyNow) {
        const { data } = await api.get(`/products/${buyNow.productId}`);
        setLines([{ _id: 'now', quantity: buyNow.quantity, size: buyNow.size, product: data }]);
      } else {
        const { data } = await api.get('/cart');
        setLines(data);
      }
    };
    load().catch((e) => setErr(errMsg(e)));
    // Pre-fill the address from the last order.
    api.get('/orders/mine').then(({ data }) => {
      const last = data[0]?.shipping;
      if (last) setF((cur) => ({ ...cur, name: last.name, mobile: last.mobile, address: last.address, city: last.city, pincode: last.pincode }));
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (!lines) return err ? <p className="err">{err}</p> : <p className="muted">Loading…</p>;
  if (!lines.length)
    return (
      <div className="card empty">
        <h2>Your cart is empty</h2>
        <Link className="btn primary" to="/">Browse the shop</Link>
      </div>
    );
  const t = summary(lines);

  const place = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const body = {
        shipping: { name: f.name, mobile: f.mobile, address: f.address, city: f.city, pincode: f.pincode },
        paymentMethod: f.paymentMethod,
        notes: f.notes,
        ...(buyNow ? { items: [buyNow] } : { fromCart: true }),
      };
      const { data } = await api.post('/orders', body);
      await refreshCart();
      notify('Order placed');
      nav(`/order/${data._id}`, { state: { fresh: true }, replace: true });
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h2>Order details</h2>
      <div className="two wide">
        <form className="card pad frm" onSubmit={place}>
          <h3 className="full">Shipping details</h3>
          <div className="field"><label htmlFor="c-name">Full name</label><input id="c-name" required autoComplete="name" value={f.name} onChange={set('name')} /></div>
          <div className="field"><label htmlFor="c-phone">Mobile</label><input id="c-phone" type="tel" required autoComplete="tel" value={f.mobile} onChange={set('mobile')} /></div>
          <div className="field full"><label htmlFor="c-line">Address</label><input id="c-line" required autoComplete="street-address" value={f.address} onChange={set('address')} /></div>
          <div className="field"><label htmlFor="c-city">City</label><input id="c-city" required value={f.city} onChange={set('city')} /></div>
          <div className="field"><label htmlFor="c-postal">Pincode / postal code</label><input id="c-postal" required value={f.pincode} onChange={set('pincode')} /></div>
          <h3 className="full">Payment method</h3>
          <div className="radios full">
            {PAY.map(([k, label]) => (
              <label className="radio" key={k} htmlFor={`pay-${k}`}>
                <input type="radio" id={`pay-${k}`} name="pay" checked={f.paymentMethod === k} onChange={() => setF({ ...f, paymentMethod: k })} />
                {label}
              </label>
            ))}
          </div>
          <p className="muted sm full">Demo project: the chosen method is recorded on the order. No money moves.</p>
          <div className="field full">
            <label htmlFor="c-notes">Special requests (optional)</label>
            <textarea id="c-notes" maxLength={300} placeholder="Gift wrap, delivery window, size notes" value={f.notes} onChange={set('notes')} />
          </div>
          {err && <p className="err" role="alert">{err}</p>}
          <div className="full"><button className="btn primary" disabled={busy}>Place order · {money(t.total)}</button></div>
        </form>
        <aside className="card pad sum">
          <h3>Your items</h3>
          {lines.map((l) => (
            <div className="ln" key={l._id}><span>{l.product.title} × {l.quantity}</span><span className="num">{money(l.product.finalPrice * l.quantity)}</span></div>
          ))}
          <div className="ln"><span>Shipping</span><span className="num">{t.ship ? money(t.ship) : 'Free'}</span></div>
          <div className="ln tot"><span>Total</span><span className="num">{money(t.total)}</span></div>
        </aside>
      </div>
    </>
  );
}
