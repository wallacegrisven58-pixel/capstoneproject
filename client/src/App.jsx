import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Auth from './pages/Auth.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Profile from './pages/Profile.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AllOrders from './pages/admin/AllOrders.jsx';
import AllProducts from './pages/admin/AllProducts.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import Storefront from './pages/admin/Storefront.jsx';

function Protected({ children, admin }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) return <Navigate to="/auth" state={{ from: loc.pathname }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="wrap main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Protected><Cart /></Protected>} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/order/:id" element={<Protected><OrderDetail /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/admin" element={<Protected admin><AdminLayout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<AllOrders />} />
            <Route path="products" element={<AllProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="store" element={<Storefront />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="foot">
        <div className="wrap">ShopEZ · Your one-stop destination for online shopping. Demo project: no real payments are processed.</div>
      </footer>
    </>
  );
}
