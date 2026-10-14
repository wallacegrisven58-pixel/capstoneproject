import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState('');

  const refreshCart = useCallback(async () => {
    try {
      const { data } = await api.get('/cart');
      setCartCount(data.reduce((a, l) => a + l.quantity, 0));
    } catch (e) {
      setCartCount(0);
    }
  }, []);

  // Restore the session on first load.
  useEffect(() => {
    const token = localStorage.getItem('shopez_token');
    if (!token) return setReady(true);
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('shopez_token'))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (user && user.role === 'user') refreshCart();
    else setCartCount(0);
  }, [user, refreshCart]);

  const login = (token, u) => {
    localStorage.setItem('shopez_token', token);
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem('shopez_token');
    setUser(null);
  };
  const notify = (msg) => {
    setToast(msg);
    clearTimeout(notify.t);
    notify.t = setTimeout(() => setToast(''), 2600);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, cartCount, refreshCart, notify }}>
      {children}
      {toast && (
        <div className="toastwrap">
          <div className="toast" role="status">{toast}</div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
