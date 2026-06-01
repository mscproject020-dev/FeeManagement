import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
  { to: '/admin/students',  icon: 'bi-people',   label: 'Students' },
  { to: '/admin/fees',      icon: 'bi-collection', label: 'Fee Structures' },
  { to: '/admin/reports',   icon: 'bi-bar-chart-line', label: 'Reports' },
  { to: '/admin/reminders', icon: 'bi-bell',     label: 'Reminders' },
];

const staffLinks = [
  { to: '/staff/dashboard',       icon: 'bi-grid-1x2',   label: 'Dashboard' },
  { to: '/staff/process-payment', icon: 'bi-cash-coin',  label: 'Process Payment' },
  { to: '/staff/payments',        icon: 'bi-receipt',    label: 'View Payments' },
];

const studentLinks = [
  { to: '/student/dashboard',       icon: 'bi-grid-1x2',      label: 'Dashboard' },
  { to: '/student/fees',            icon: 'bi-file-earmark-text', label: 'My Fees' },
  { to: '/student/make-payment',    icon: 'bi-credit-card',   label: 'Make Payment' },
  { to: '/student/payment-history', icon: 'bi-clock-history', label: 'History' },
  { to: '/student/profile',         icon: 'bi-person',        label: 'Profile' },
];

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const links =
    user.role === 'administrator' ? adminLinks :
    user.role === 'staff' ? staffLinks : studentLinks;

  const sectionLabel =
    user.role === 'administrator' ? 'Administration' :
    user.role === 'staff' ? 'Staff Console' : 'Student Portal';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-seal" />
        <div className="brand-name">Pandit S. N. Shukla<br />University</div>
        <div className="brand-sub">Fees Portal · 2025–26</div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="nav-section-label">{sectionLabel}</div>
        {links.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-item${location.pathname === to ? ' active' : ''}`}
          >
            <i className={`bi ${icon} nav-icon`} />
            {label}
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{getInitials(user.name)}</div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-left" style={{ fontSize: 13 }} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
