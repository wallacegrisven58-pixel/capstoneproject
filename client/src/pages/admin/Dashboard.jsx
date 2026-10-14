import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, money } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { orderNo } from '../../components/OrderBody.jsx';

const Stat = ({ v, k }) => (
  <div className="card stat"><div className="v">{v}</div><div className="k">{k}</div></div>
);

export default function Dashboard() {
  const { notify } = useAuth();
  const [stats, setStats] = useState(null);
  const [todo, setTodo] = useState([]);

  const load = useCallback(() => {
    Promise.all([api.get('/admin/stats'), api.get('/orders', { params: { status: 'Placed' } })])
      .then(([s, o]) => {
        setStats(s.data);
        setTodo(o.data);
      })
      .catch((e) => notify(errMsg(e)));
  }, [notify]);
  useEffect(load, [load]);

  const pack = async (o) => {
    await api.put(`/orders/${o._id}/status`, { status: 'Packed' });
    notify('Order marked packed');
    load();
  };

  if (!stats) return <p className="muted">Loading…</p>;
  const cats = Object.keys(stats.byCategory).sort((a, b) => stats.byCategory[b] - stats.byCategory[a]);
  const top = stats.byCategory[cats[0]] || 1;

  return (
    <>
      <div className="stats">
        <Stat v={stats.orders} k="Orders" />
        <Stat v={stats.waiting} k="Waiting to pack" />
        <Stat v={money(stats.revenue)} k="Revenue" />
        <Stat v={stats.products} k="Products" />
        <Stat v={stats.customers} k="Customers" />
      </div>
      <div className="two">
        <div className="card pad" style={{ display: 'grid', gap: 10 }}>
          <h3>Needs action</h3>
          {todo.length === 0 && <p className="muted">Nothing waiting. New orders show up here.</p>}
          {todo.map((o) => (
            <div className="ol" style={{ alignItems: 'center' }} key={o._id}>
              <span><Link to={`/order/${o._id}`}><b>#{orderNo(o)}</b></Link> · {o.customerName} · {money(o.total)}</span>
              <button className="btn sm primary" onClick={() => pack(o)}>Mark packed</button>
            </div>
          ))}
        </div>
        <div className="card pad" style={{ display: 'grid', gap: 10 }}>
          <h3>Low stock</h3>
          {stats.lowStock.length === 0 && <p className="muted">All products are well stocked.</p>}
          {stats.lowStock.map((p) => (
            <div className="ol" key={p.id}><span>{p.title}</span><b className="num">{p.stock ? `${p.stock} left` : 'Sold out'}</b></div>
          ))}
        </div>
      </div>
      <div className="card pad" style={{ display: 'grid', gap: 12 }}>
        <h3>Sales by category</h3>
        {cats.length === 0 && <p className="muted">No sales yet.</p>}
        <div className="bars">
          {cats.map((c) => (
            <div key={c}>
              <div className="ol"><span>{c}</span><span className="num">{money(stats.byCategory[c])}</span></div>
              <div className="track"><div className="fill" style={{ '--w': `${Math.round((stats.byCategory[c] / top) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
