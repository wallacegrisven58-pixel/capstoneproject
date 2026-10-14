import { dstr, money, payName, STATUS } from '../api.js';

export const Steps = ({ status }) => {
  const ix = STATUS.indexOf(status);
  return (
    <div className="steps">
      {STATUS.map((s, i) => <div key={s} className={i <= ix ? 'done' : ''}>{s}</div>)}
    </div>
  );
};

export const orderNo = (o) => `SE-${String(o._id).slice(-6).toUpperCase()}`;

export default function OrderBody({ o }) {
  return (
    <>
      <Steps status={o.status} />
      <div className="rows">
        {o.items.map((i, ix) => (
          <div className="ol" key={ix}>
            <span>{i.name}{i.size && i.size !== 'One size' ? ` (${i.size})` : ''} × {i.quantity}</span>
            <span className="num">{money(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="ol muted"><span>Shipping</span><span className="num">{o.shippingFee ? money(o.shippingFee) : 'Free'}</span></div>
        <div className="ol"><b>Total</b><b className="num">{money(o.total)}</b></div>
      </div>
      <div className="muted sm" style={{ marginTop: 12 }}>
        Ship to: {o.shipping.name}, {o.shipping.address}, {o.shipping.city} {o.shipping.pincode} · {o.shipping.mobile}
        <br />Payment: {payName(o.paymentMethod)}
        {o.notes ? <><br />Requests: {o.notes}</> : null}
      </div>
    </>
  );
}

export const OrderHead = ({ o, who }) => (
  <div className="hd">
    <div><b>Order #{orderNo(o)}</b> <span className="muted sm">· {who ? `${o.customerName} · ` : ''}{dstr(o.createdAt)}</span></div>
    <div><span className={`pill ${o.status}`}>{o.status}</span></div>
  </div>
);
