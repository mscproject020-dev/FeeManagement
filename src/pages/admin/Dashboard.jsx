import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/api/admin/dashboard').then(r => setData(r.data));
  }, []);

  if (!data) return <div className="center-loader"><div className="spinner-ring" /></div>;

  const { totalStudents, totalRevenue, recentTxns, pendingReminders } = data;

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Administration</div>
        <div className="page-title">Overview</div>
        <div className="page-sub">University fee collection at a glance.</div>
      </div>

      <div className="stat-grid">
        {[
          { label: 'Total Students',      value: totalStudents,                  },
          { label: 'Revenue Collected',   value: `₹${totalRevenue?.toLocaleString('en-IN') ?? 0}`, className: 'gold' },
          { label: 'Transactions',        value: recentTxns?.length ?? 0         },
          { label: 'Pending Reminders',   value: pendingReminders,               },
        ].map(({ label, value, className = '' }) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className={`stat-value ${className}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Recent Transactions</span>
          <span className="text-mono">Last 5 records</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt No.</th>
                <th>Student</th>
                <th>Fee</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTxns?.length ? recentTxns.map(t => (
                <tr key={t._id}>
                  <td><span className="text-mono">{t.receipt_no}</span></td>
                  <td style={{ color: 'var(--text-1)' }}>{t.student_id?.name ?? '—'}</td>
                  <td>{t.fee_id?.fee_category ?? '—'}</td>
                  <td style={{ color: 'var(--gold-3)', fontFamily: 'var(--font-serif)' }}>
                    ₹{t.amount?.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className="badge badge-paid" style={{ textTransform: 'capitalize' }}>
                      {t.payment_method}
                    </span>
                  </td>
                  <td><span className="text-mono">{new Date(t.payment_date).toLocaleDateString('en-IN')}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px' }}>No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
