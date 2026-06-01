import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/student/profile').then(r => {
      const { name, phone, address } = r.data;
      setForm({ name: name || '', phone: phone || '', address: address || '' });
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(''); setError('');
    try {
      await axios.put('/api/student/profile', form);
      setMsg('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="center-loader"><div className="spinner-ring" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Student Portal</div>
        <div className="page-title">My Profile</div>
      </div>

      <div style={{ maxWidth: 540 }}>
        {/* Read-only info */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-head"><span className="panel-title">Account Information</span></div>
          <div className="panel-body">
            <div className="form-grid-2">
              {[
                ['Roll Number', user?.roll_no],
                ['Email',       user?.email],
                ['Course',      user?.course],
                ['Semester',    user?.semester],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-1)' }}>{val || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editable */}
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Edit Details</span></div>
          <div className="panel-body">
            {msg   && <div className="alert alert-success"><i className="bi bi-check-circle" />{msg}</div>}
            {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" />{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-field">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} placeholder="+91 XXXXXXXXXX"
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" rows={3} value={form.address} placeholder="Full address"
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner-ring" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
