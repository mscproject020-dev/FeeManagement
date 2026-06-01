import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/api/student/dashboard').then(r => setData(r.data));
  }, []);

  if (!data) return <div className="center-loader"><div className="spinner-ring" /></div>;

  const { totalPaid, totalDue, pendingCount } = data;

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Student Portal</div>
        <div className="page-title">Welcome back, {user?.name?.split(' ')[0]}.</div>
        <div className="page-sub">{user?.course} · Semester {user?.semester} · {user?.roll_no}</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value gold">₹{totalPaid?.toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outstanding Dues</div>
          <div className={`stat-value ${totalDue > 0 ? 'danger' : ''}`}>
            ₹{totalDue?.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Fees</div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-trend">{pendingCount > 0 ? 'Action required' : 'All clear'}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { to: '/student/fees',         icon: 'bi-file-earmark-text', label: 'View Fee Details',  sub: 'Check all dues' },
          { to: '/student/make-payment', icon: 'bi-credit-card',       label: 'Make a Payment',    sub: 'Pay online securely' },
          { to: '/student/payment-history', icon: 'bi-clock-history',  label: 'Payment History',   sub: 'View & download receipts' },
        ].map(({ to, icon, label, sub }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="panel" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div className="panel-body" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <i className={`bi ${icon}`} style={{ fontSize: 28, color: 'var(--gold-2)', marginBottom: 12, display: 'block' }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
