import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function StaffDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { axios.get('/api/staff/dashboard').then(r => setData(r.data)); }, []);
  if (!data) return <div className="center-loader"><div className="spinner-ring" /></div>;

  const { todayCollection, recentTxns, totalCount } = data;

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Staff Console</div>
        <div className="page-title">Collection Dashboard</div>
        <div className="page-sub">Today's fee intake at a glance.</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Collection</div>
          <div className="stat-value gold">₹{todayCollection?.toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{totalCount}</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:14, marginBottom:24 }}>
        <Link to="/staff/process-payment" className="btn btn-primary">
          <i className="bi bi-cash-coin" /> Process Payment
        </Link>
        <Link to="/staff/payments" className="btn btn-ghost">
          <i className="bi bi-receipt" /> View All
        </Link>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Recent Collections</span>
          <span className="text-mono">Last 10</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Receipt No.</th><th>Student</th><th>Fee</th><th>Amount</th><th>Method</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recentTxns?.map(t => (
                <tr key={t._id}>
                  <td><span className="text-mono">{t.receipt_no}</span></td>
                  <td style={{ color:'var(--text-1)' }}>{t.student_id?.name ?? '—'}</td>
                  <td>{t.fee_id?.fee_category ?? '—'}</td>
                  <td style={{ fontFamily:'var(--font-serif)', color:'var(--gold-3)' }}>₹{t.amount?.toLocaleString('en-IN')}</td>
                  <td><span className="badge badge-paid" style={{textTransform:'capitalize'}}>{t.payment_method}</span></td>
                  <td><span className="text-mono">{new Date(t.payment_date).toLocaleDateString('en-IN')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
