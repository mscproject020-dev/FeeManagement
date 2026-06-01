import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProcessPayment() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [fees,     setFees]     = useState([]);
  const [form,     setForm]     = useState({ student_id:'', fee_id:'', payment_method:'cash' });
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    axios.get('/api/admin/students').then(r => setStudents(r.data));
    axios.get('/api/admin/fees').then(r => setFees(r.data));
  }, []);

  const handleFeeChange = (id) => {
    setForm(f => ({ ...f, fee_id: id }));
    setSelected(fees.find(f => f._id === id) || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await axios.post('/api/staff/payments', { ...form, amount: selected?.amount });
      setDone(true);
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to record payment.');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div>
      <div className="page-header"><div className="page-eyebrow">Staff Console</div><div className="page-title">Payment Recorded</div></div>
      <div className="panel" style={{ maxWidth:440 }}>
        <div className="panel-body" style={{ textAlign:'center', padding:'40px 32px' }}>
          <i className="bi bi-check-circle" style={{ fontSize:48, color:'#5DBF8E', display:'block', marginBottom:16 }} />
          <div style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--text-1)', marginBottom:20 }}>
            Payment recorded successfully
          </div>
          <div className="flex-gap" style={{ justifyContent:'center' }}>
            <button className="btn btn-primary" onClick={() => { setDone(false); setForm({student_id:'',fee_id:'',payment_method:'cash'}); setSelected(null); }}>
              New Payment
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/staff/payments')}>View All</button>
          </div>
        </div>
      </div>
    </div>
  );

  const methods = [
    { id:'cash', icon:'bi-cash-stack',          label:'Cash' },
    { id:'dd',   icon:'bi-building-fill-check', label:'D/D' },
    { id:'neft', icon:'bi-bank',                label:'NEFT' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Staff Console</div>
        <div className="page-title">Process Payment</div>
        <div className="page-sub">Record a manual fee collection.</div>
      </div>

      {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" />{error}</div>}

      <div style={{ maxWidth:540 }}>
        <form onSubmit={handleSubmit}>
          <div className="panel" style={{ marginBottom:16 }}>
            <div className="panel-head"><span className="panel-title">Select Student & Fee</span></div>
            <div className="panel-body">
              <div className="form-field">
                <label className="form-label">Student</label>
                <select className="form-select" value={form.student_id}
                  onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} required>
                  <option value="">— Select student —</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.roll_no})</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Fee</label>
                <select className="form-select" value={form.fee_id} onChange={e => handleFeeChange(e.target.value)} required>
                  <option value="">— Select fee —</option>
                  {fees.map(f => <option key={f._id} value={f._id}>{f.fee_category} — ₹{f.amount}</option>)}
                </select>
              </div>
              {selected && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle" />
                  Amount to collect: <strong style={{ fontFamily:'var(--font-serif)', color:'var(--gold-3)' }}>₹{selected.amount?.toLocaleString('en-IN')}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><span className="panel-title">Payment Method</span></div>
            <div className="panel-body">
              <div style={{ display:'flex', gap:12, marginBottom:20 }}>
                {methods.map(m => (
                  <button key={m.id} type="button"
                    className={`payment-method-btn${form.payment_method === m.id ? ' active' : ''}`}
                    style={{ flex:1 }}
                    onClick={() => setForm(f => ({ ...f, payment_method: m.id }))}>
                    <i className={`bi ${m.icon} pm-icon`} />
                    {m.label}
                  </button>
                ))}
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading
                  ? <><span className="spinner-ring" style={{width:16,height:16,borderWidth:2}} /> Recording…</>
                  : <><i className="bi bi-check-lg" /> Record Payment of ₹{selected?.amount?.toLocaleString('en-IN') ?? '—'}</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
