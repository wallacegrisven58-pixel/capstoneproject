import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { dstr, errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import OrderBody, { OrderHead } from '../components/OrderBody.jsx';

export default function Profile() {
  const { user, logout, notify } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders/mine').then(({ data }) => setOrders(data)).catch((e) => notify(errMsg(e)));
  }, [notify]);

  return (
    <>
      <div className="card pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>{user.username}</h2>
          <p className="muted">{user.email} · Member since {dstr(user.createdAt)}</p>
        </div>
        <button className="btn" onClick={() => { logout(); notify('Logged out'); nav('/'); }}>Log out</button>
      </div>
      <h2>Your orders</h2>
      {!orders && <p className="muted">Loading…</p>}
      {orders && !orders.length && (
        <div className="card empty"><h3>No orders yet</h3><Link className="btn primary" to="/">Start shopping</Link></div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
        {orders?.map((o) => (
          <div className="card order" key={o._id}>
            <OrderHead o={o} />
            <OrderBody o={o} />
          </div>
        ))}
      </div>
    </>
  );
}
