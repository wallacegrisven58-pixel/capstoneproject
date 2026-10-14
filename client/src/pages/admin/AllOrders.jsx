import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, STATUS } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import OrderBody, { OrderHead } from '../../components/OrderBody.jsx';

export default function AllOrders() {
  const { notify } = useAuth();
  const [status, setStatus] = useState('All');
  const [orders, setOrders] = useState(null);

  const load = useCallback(() => {
    api.get('/orders', { params: { status } }).then(({ data }) => setOrders(data)).catch((e) => notify(errMsg(e)));
  }, [status, notify]);
  useEffect(load, [load]);

  const advance = async (o) => {
    const next = STATUS[STATUS.indexOf(o.status) + 1];
    await api.put(`/orders/${o._id}/status`, { status: next });
    notify(`Order marked ${next.toLowerCase()}`);
    load();
  };

  return (
    <>
      <div className="chips">
        {['All', ...STATUS].map((s) => <button key={s} className={'chip' + (status === s ? ' on' : '')} onClick={() => setStatus(s)}>{s}</button>)}
      </div>
      {!orders && <p className="muted">Loading…</p>}
      {orders && !orders.length && <div className="card empty"><h3>No {status === 'All' ? '' : status.toLowerCase() + ' '}orders</h3></div>}
      <div style={{ display: 'grid', gap: 14 }}>
        {orders?.map((o) => {
          const next = STATUS[STATUS.indexOf(o.status) + 1];
          return (
            <div className="card order" key={o._id}>
              <OrderHead o={o} who />
              <OrderBody o={o} />
              {next && <div><button className="btn primary sm" onClick={() => advance(o)}>Mark as {next.toLowerCase()}</button></div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
