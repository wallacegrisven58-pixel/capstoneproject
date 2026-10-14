import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api, { dstr, errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import OrderBody, { orderNo } from '../components/OrderBody.jsx';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const fresh = useLocation().state?.fresh;
  const [o, setO] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setO(data)).catch((e) => setErr(errMsg(e)));
  }, [id]);

  if (err) return <div className="card empty"><h2>Order not found</h2><p className="muted">{err}</p><Link className="btn primary" to="/profile">Back to your orders</Link></div>;
  if (!o) return <p className="muted">Loading…</p>;

  return (
    <div className="card pad" style={{ display: 'grid', gap: 6 }}>
      <div className="eyebrow">{fresh ? 'Order confirmed' : 'Order details'}</div>
      <h2>Order #{orderNo(o)}</h2>
      <p className="muted">
        {fresh ? `Thanks, ${o.customerName.split(' ')[0]}. The seller has been notified and will pack it next.` : `Placed ${dstr(o.createdAt)}`}
      </p>
      <OrderBody o={o} />
      <div style={{ marginTop: 12 }}>
        <Link className="btn" to={user?.role === 'admin' ? '/admin/orders' : '/profile'}>{user?.role === 'admin' ? 'All orders' : 'Your orders'}</Link>{' '}
        <Link className="btn primary" to="/">Keep shopping</Link>
      </div>
    </div>
  );
}
