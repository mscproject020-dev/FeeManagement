import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminReminders() {
  const [reminders, setReminders] = useState([]);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => axios.get('/api/admin/reminders').then(r => setReminders(r.data));
  useEffect(() => { load(); }, []);

  const sendAll = async () => {
    setSending(true); setMsg('');
    await axios.post('/api/admin/reminders');
    await load();
    setMsg('Reminders sent to all defaulters.');
    setSending(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-eyebrow">Administration</div>
            <div className="page-title">Fee Reminders</div>
            <div className="page-sub">{reminders.length} reminder records</div>
          </div>
          <button className="btn btn-primary" onClick={sendAll} disabled={sending}>
            <i className="bi bi-bell" /> {sending ? 'Sending…' : 'Send to All Defaulters'}
          </button>
        </div>
      </div>

      {msg && <div className="alert alert-success"><i className="bi bi-check-circle" />{msg}</div>}

      <div className="panel">
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Fee</th><th>Message</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {reminders.map(r => (
                <tr key={r._id}>
                  <td style={{ color:'var(--text-1)' }}>{r.student_id?.name ?? '—'}</td>
                  <td>{r.fee_id?.fee_category ?? '—'}</td>
                  <td style={{ fontSize:12, color:'var(--text-3)', maxWidth:240 }}>{r.message}</td>
                  <td><span className="text-mono">{new Date(r.reminder_date).toLocaleDateString('en-IN')}</span></td>
                  <td><span className={`badge ${r.status==='sent'?'badge-paid':'badge-pending'}`}>{r.status}</span></td>
                </tr>
              ))}
              {!reminders.length && (
                <tr><td colSpan={5} style={{textAlign:'center',color:'var(--text-3)',padding:32}}>No reminders yet. Click "Send to All Defaulters" to generate.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
