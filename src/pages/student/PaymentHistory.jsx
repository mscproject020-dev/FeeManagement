import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function PaymentHistory() {
  const [txns, setTxns] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/student/payments').then(r => {
      setTxns(r.data);
      setLoading(false);
    });
  }, []);

  const filtered = txns.filter(t =>
    t.fee_id?.fee_category?.toLowerCase().includes(q.toLowerCase()) ||
    t.receipt_no?.toLowerCase().includes(q.toLowerCase())
  );

  if (loading) return <div className="center-loader"><div className="spinner-ring" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Student Portal</div>
        <div className="page-title">Payment History</div>
        <div className="page-sub">{txns.length} transaction{txns.length !== 1 ? 's' : ''} recorded</div>
      </div>

      <div className="search-bar">
        <i className="bi bi-search search-icon" />
        <input
          placeholder="Search by fee or receipt number…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div className="panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt No.</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map(t => (
                <tr key={t._id}>
                  <td><span className="text-mono">{t.receipt_no}</span></td>
                  <td style={{ color: 'var(--text-1)' }}>{t.fee_id?.fee_category ?? '—'}</td>
                  <td style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-3)' }}>
                    ₹{t.amount?.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className="badge badge-paid" style={{ textTransform: 'capitalize' }}>
                      {t.payment_method}
                    </span>
                  </td>
                  <td><span className="text-mono">{new Date(t.payment_date).toLocaleDateString('en-IN')}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/student/receipt/${t.receipt_no}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px' }}>
                    {q ? 'No matching records.' : 'No payment history yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
