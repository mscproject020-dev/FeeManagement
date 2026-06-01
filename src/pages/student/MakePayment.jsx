import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

export default function MakePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillFeeId = new URLSearchParams(location.search).get('fee_id');

  const [fees, setFees] = useState([]);
  const [feeId, setFeeId] = useState(prefillFeeId || '');
  const [method, setMethod] = useState('online');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    axios.get('/api/student/fees').then(r => {
      const pending = r.data.filter(f => !f.paid);
      setFees(pending);
      if (prefillFeeId) setSelected(pending.find(f => f._id === prefillFeeId) || null);
    });
  }, []);

  const handleFeeChange = (id) => {
    setFeeId(id);
    setSelected(fees.find(f => f._id === id) || null);
  };

  const handlePay = async () => {
    if (!feeId) return setError('Please select a fee.');
    setLoading(true); setError('');
    try {
      await axios.post('/api/student/payments', {
        fee_id: feeId,
        payment_method: method,
        amount: selected?.amount,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Student Portal</div>
        <div className="page-title">Payment Complete</div>
      </div>
      <div className="panel" style={{ maxWidth: 480 }}>
        <div className="panel-body" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            <i className="bi bi-check-circle" style={{ color: '#5DBF8E' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-1)', marginBottom: 8 }}>
            Payment recorded successfully
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28 }}>
            ₹{selected?.amount?.toLocaleString('en-IN')} — {selected?.fee_category}
          </div>
          <div className="flex-gap" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/student/payment-history')}>
              View History
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/student/dashboard')}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const methods = [
    { id: 'online', icon: 'bi-credit-card-2-front', label: 'Card' },
    { id: 'upi',    icon: 'bi-phone',                label: 'UPI' },
    { id: 'cash',   icon: 'bi-cash-stack',           label: 'Cash' },
    { id: 'dd',     icon: 'bi-building-fill-check',  label: 'D/D' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Student Portal</div>
        <div className="page-title">Make Payment</div>
        <div className="page-sub">Settle your outstanding dues securely.</div>
      </div>

      {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" />{error}</div>}

      <div style={{ maxWidth: 540 }}>
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Select Fee</span></div>
          <div className="panel-body">
            <div className="form-field">
              <label className="form-label">Pending fee</label>
              <select className="form-select" value={feeId} onChange={e => handleFeeChange(e.target.value)}>
                <option value="">— Select a fee to pay —</option>
                {fees.map(f => (
                  <option key={f._id} value={f._id}>
                    {f.fee_category} · ₹{f.amount} · Due {new Date(f.due_date).toLocaleDateString('en-IN')}
                  </option>
                ))}
              </select>
              {fees.length === 0 && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#5DBF8E' }}>
                  <i className="bi bi-check-circle me-1" /> All fees cleared — nothing pending.
                </div>
              )}
            </div>

            {selected && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle" />
                <div>
                  <strong>{selected.fee_category}</strong> —
                  <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-3)' }}> ₹{selected.amount?.toLocaleString('en-IN')}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: 12 }}> · Due {new Date(selected.due_date).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><span className="panel-title">Payment Method</span></div>
          <div className="panel-body">
            <div className="payment-methods">
              {methods.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={`payment-method-btn${method === m.id ? ' active' : ''}`}
                  onClick={() => setMethod(m.id)}
                >
                  <i className={`bi ${m.icon} pm-icon`} />
                  {m.label}
                </button>
              ))}
            </div>

            {method === 'online' && (
              <div style={{ padding: '16px', background: 'var(--dark)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 14 }}>
                  SIMULATED — no real transaction
                </div>
                <div className="form-grid-2" style={{ marginBottom: 12 }}>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Card Number</label>
                    <input className="form-input" placeholder="4111 1111 1111 1111" maxLength={19} />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Name on Card</label>
                    <input className="form-input" placeholder="As printed" />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expiry</label>
                    <input className="form-input" placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">CVV</label>
                    <input className="form-input" type="password" placeholder="•••" maxLength={3} />
                  </div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="form-field">
                <label className="form-label">UPI ID</label>
                <input className="form-input" placeholder="yourname@upi" />
              </div>
            )}

            {(method === 'cash' || method === 'dd') && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle" />
                {method === 'cash'
                  ? 'Submit cash at the university fee counter. This logs your intent.'
                  : 'Demand Draft in favour of "Pandit S. N. Shukla University". Submit at accounts office.'}
              </div>
            )}

            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 8 }}
              onClick={handlePay}
              disabled={loading || !feeId}
            >
              {loading ? (
                <><span className="spinner-ring" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing…</>
              ) : (
                <><i className="bi bi-lock-fill" /> Pay ₹{selected?.amount?.toLocaleString('en-IN') || '—'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
