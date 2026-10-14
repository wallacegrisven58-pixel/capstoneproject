import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const { login, notify } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [tab, setTab] = useState('login');
  const [f, setF] = useState({ username: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const url = tab === 'login' ? '/auth/login' : '/auth/register';
      const body = tab === 'login' ? { email: f.email, password: f.password } : f;
      const { data } = await api.post(url, body);
      login(data.token, data.user);
      notify(tab === 'login' ? `Welcome back, ${data.user.username.split(' ')[0]}` : 'Account created');
      nav(data.user.role === 'admin' ? '/admin' : loc.state?.from || '/', { replace: true });
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, marginInline: 'auto', width: '100%', display: 'grid', gap: 16 }}>
      <h2>Welcome to ShopEZ</h2>
      <div className="chips">
        <button className={'chip' + (tab === 'login' ? ' on' : '')} onClick={() => setTab('login')}>Log in</button>
        <button className={'chip' + (tab === 'register' ? ' on' : '')} onClick={() => setTab('register')}>Create account</button>
      </div>
      <form className="card pad frm" onSubmit={submit}>
        {tab === 'register' && (
          <div className="field full">
            <label htmlFor="a-name">Name</label>
            <input id="a-name" autoComplete="name" required value={f.username} onChange={set('username')} />
          </div>
        )}
        <div className="field full">
          <label htmlFor="a-email">Email</label>
          <input id="a-email" type="email" autoComplete="email" required value={f.email} onChange={set('email')} />
        </div>
        <div className="field full">
          <label htmlFor="a-pw">Password</label>
          <input id="a-pw" type="password" minLength={6} required autoComplete={tab === 'login' ? 'current-password' : 'new-password'} value={f.password} onChange={set('password')} />
          {tab === 'register' && <small>At least 6 characters.</small>}
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <div className="full"><button className="btn primary block" disabled={busy}>{tab === 'login' ? 'Log in' : 'Create account'}</button></div>
      </form>
      <div className="card pad" style={{ display: 'grid', gap: 8 }}>
        <h3>Seller account</h3>
        <p className="muted sm">After running the seed script, log in as the seller to manage orders and products.</p>
        <button className="btn sm" onClick={() => { setTab('login'); setF({ ...f, email: 'admin@shopez.demo', password: 'admin123' }); }}>Fill in the demo seller login</button>
        <p className="muted sm">admin@shopez.demo / admin123</p>
      </div>
    </div>
  );
}
