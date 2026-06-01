import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMOS = {
  administrator: { email: 'admin@fees.com',    password: 'admin123' },
  staff:         { email: 'priya@fees.com',    password: 'staff123' },
  student:       { email: 'rahul@student.com', password: 'student123' },
};

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [role,     setRole]     = useState('student');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const fillDemo = () => {
    const d = DEMOS[role];
    setEmail(d.email);
    setPassword(d.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, role);
      navigate(
        role === 'administrator' ? '/admin/dashboard' :
        role === 'staff'         ? '/staff/dashboard' :
        '/student/dashboard'
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left panel — branding */}
      <div className="login-left">
        <div className="login-seal">
          <div className="seal-inner" />
        </div>
        <div className="login-uni-name">
          Pandit S. N. Shukla<br />University
        </div>
        <div className="login-uni-sub">Shahdol, Madhya Pradesh · Est. 1983</div>
        <ul className="login-feature-list">
          <li>Secure online fee submission</li>
          <li>Real-time payment tracking</li>
          <li>Instant digital receipts</li>
          <li>Administrative oversight portal</li>
        </ul>
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-form-card">
          <div className="login-form-eyebrow">Online Fees Portal</div>
          <div className="login-form-title">Sign in</div>
          <div className="login-form-sub">Access your account below.</div>

          {error && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-triangle" />
              {error}
            </div>
          )}

          {/* Role selector */}
          <div className="role-selector">
            {['student', 'staff', 'administrator'].map(r => (
              <button
                key={r}
                type="button"
                className={`role-btn${role === r ? ' active' : ''}`}
                onClick={() => { setRole(r); setEmail(''); setPassword(''); }}
              >
                {r === 'administrator' ? 'Admin' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <><span className="spinner-ring" style={{ width: 18, height: 18, borderWidth: 2 }} />Signing in…</>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="demo-hint">
            <strong>Demo credentials for {role}:</strong><br />
            {DEMOS[role].email} / {DEMOS[role].password}
            <button
              onClick={fillDemo}
              style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--gold-2)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            >
              Fill ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
