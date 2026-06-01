import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function FeeDetails() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/student/fees').then(r => {
      setFees(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="center-loader"><div className="spinner-ring" /></div>;

  const paid    = fees.filter(f => f.paid);
  const pending = fees.filter(f => !f.paid);
  const totalDue = pending.reduce((s, f) => s + (f.amount || 0), 0);

  const getStatus = (f) => {
    if (f.paid) return 'paid';
    if (new Date(f.due_date) < new Date()) return 'overdue';
    return 'pending';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Student Portal</div>
        <div className="page-title">Fee Details</div>
        <div className="page-sub">{pending.length} pending · ₹{totalDue.toLocaleString('en-IN')} due</div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 560, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Total Fees</div>
          <div className="stat-value">{fees.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cleared</div>
          <div className="stat-value" style={{ color: '#5DBF8E' }}>{paid.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value danger">{pending.length}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">All Fee Items</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(f => {
                const status = getStatus(f);
                return (
                  <tr key={f._id}>
                    <td style={{ color: 'var(--text-1)', fontWeight: 500 }}>{f.fee_category}</td>
                    <td style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-3)' }}>
                      ₹{f.amount?.toLocaleString('en-IN')}
                    </td>
                    <td><span className="text-mono">{new Date(f.due_date).toLocaleDateString('en-IN')}</span></td>
                    <td>
                      <span className={`badge badge-${status}`}>{status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {f.paid ? (
                        <Link to={`/student/receipt/${f.txn_receipt}`} className="btn btn-ghost btn-sm">
                          Receipt
                        </Link>
                      ) : (
                        <Link to={`/student/make-payment?fee_id=${f._id}`} className="btn btn-primary btn-sm">
                          Pay now
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
