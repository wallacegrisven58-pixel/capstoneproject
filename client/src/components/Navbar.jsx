import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout, cartCount, notify } = useAuth();
  const [q, setQ] = useState('');
  const nav = useNavigate();

  const search = (e) => {
    e.preventDefault();
    nav(`/?q=${encodeURIComponent(q)}`);
  };
  const out = () => {
    logout();
    notify('Logged out');
    nav('/');
  };
  const cls = ({ isActive }) => 'navb' + (isActive ? ' on' : '');

  return (
    <header className="top">
      <div className="wrap bar">
        <Link className="logo" to="/">Shop<b>EZ</b></Link>
        <form className="search" onSubmit={search} role="search">
          <input id="hq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search accessories" aria-label="Search products" />
          <button className="btn sm primary">Search</button>
        </form>
        <nav className="nav" aria-label="Main">
          <NavLink className={cls} to="/" end>Shop</NavLink>
          {user?.role === 'admin' && <NavLink className={cls} to="/admin">Seller dashboard</NavLink>}
          {user?.role === 'user' && (
            <NavLink className={cls} to="/cart">Cart<span className="cnt">{cartCount}</span></NavLink>
          )}
          {user ? (
            <>
              <NavLink className={cls} to="/profile">{user.username.split(' ')[0]}</NavLink>
              <button className="navb" onClick={out}>Log out</button>
            </>
          ) : (
            <NavLink className={cls} to="/auth">Log in</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
