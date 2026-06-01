import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminReports() {
  const [txns, setTxns] = useState([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to)   params.set('to', to);
    const r = await axios.get(`/api/admin/reports?${params}`);
    setTxns(r.data.txns);
    setTotal(r.data.total);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Administration</div>
        <div className="page-title">Revenue Reports</div>
        <div className="page-sub">Filter transactions by date range.</div>
      </div>

      {/* Filter bar */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-body">
          <div style={{ display:'flex', gap:16, alignItems:'flex-end', flexWrap:'wrap' }}>
            <div className="form-field" style={{ marginBottom:0, flex:1, minWidth:160 }}>
              <label className="form-label">From</label>
              <input className="form-input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
            </div>
            <div className="form-field" style={{ marginBottom:0, flex:1, minWidth:160 }}>
              <label className="form-label">To</label>
              <input className="form-input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={load} disabled={loading}>
              {loading ? 'Loading…' : 'Apply Filter'}
            </button>
            <button className="btn btn-ghost" onClick={() => { setFrom(''); setTo(''); setTimeout(load, 0); }}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns:'1fr 1fr', maxWidth:420, marginBottom:24 }}>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{txns.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Collected</div>
          <div className="stat-value gold">₹{total?.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Transaction Log</span>
          <span className="text-mono">{txns.length} records</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Receipt No.</th><th>Student</th><th>Fee</th><th>Amount</th><th>Method</th><th>Date</th></tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t._id}>
                  <td><span className="text-mono">{t.receipt_no}</span></td>
                  <td style={{ color:'var(--text-1)' }}>{t.student_id?.name ?? '—'}</td>
                  <td>{t.fee_id?.fee_category ?? '—'}</td>
                  <td style={{ fontFamily:'var(--font-serif)', color:'var(--gold-3)' }}>₹{t.amount?.toLocaleString('en-IN')}</td>
                  <td><span className="badge badge-paid" style={{textTransform:'capitalize'}}>{t.payment_method}</span></td>
                  <td><span className="text-mono">{new Date(t.payment_date).toLocaleDateString('en-IN')}</span></td>
                </tr>
              ))}
              {!txns.length && (
                <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-3)',padding:32}}>No records for selected range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
