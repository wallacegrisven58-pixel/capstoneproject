import { NavLink, Outlet } from 'react-router-dom';

const cls = ({ isActive }) => 'tab' + (isActive ? ' on' : '');

export default function AdminLayout() {
  return (
    <>
      <h2>Seller dashboard</h2>
      <div className="tabs">
        <NavLink className={cls} to="/admin" end>Dashboard</NavLink>
        <NavLink className={cls} to="/admin/orders">Orders</NavLink>
        <NavLink className={cls} to="/admin/products" end>Products</NavLink>
        <NavLink className={cls} to="/admin/store">Storefront</NavLink>
        <NavLink className="tab" to="/admin/products/new" style={{ marginLeft: 'auto' }}>+ New product</NavLink>
      </div>
      <Outlet />
    </>
  );
}
