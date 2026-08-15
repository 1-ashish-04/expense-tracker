import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, ArrowLeftRight, Wallet, Tags, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/accounts', label: 'Accounts', icon: Wallet },
  { to: '/categories', label: 'Categories', icon: Tags },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">₹</span>
          <span className="sidebar-brand-name">Ledger</span>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-avatar">{user?.username?.[0]?.toUpperCase() ?? '?'}</span>
            <span className="sidebar-user-name">{user?.username}</span>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} type="button">
            <LogOut size={17} strokeWidth={2} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>

      <nav className="tabbar" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `tabbar-link${isActive ? ' is-active' : ''}`}
          >
            <Icon size={20} strokeWidth={2} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
