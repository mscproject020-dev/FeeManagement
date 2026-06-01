import { useState, useEffect } from 'react';
import axios from 'axios';

const empty = { fee_category:'', course:'M.Sc. CS', semester:'4', amount:'', due_date:'', academic_year:'2025-26', status:'active' };

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => axios.get('/api/admin/fees').then(r => setFees(r.data));
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(empty); setEditId(null); setError(''); setModal(true); };
  const openEdit = (f) => { setForm({ ...f, due_date: f.due_date?.slice(0,10) }); setEditId(f._id); setError(''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editId) await axios.put('/api/admin/fees', { ...form, id: editId, amount: Number(form.amount) });
      else        await axios.post('/api/admin/fees', { ...form, amount: Number(form.amount) });
      setModal(false); load();
    } catch(err) { setError(err.response?.data?.error || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this fee structure?')) return;
    await axios.delete(`/api/admin/fees?id=${id}`);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-eyebrow">Administration</div>
            <div className="page-title">Fee Structures</div>
            <div className="page-sub">{fees.length} fee items configured</div>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="bi bi-plus-lg" /> Add Fee
          </button>
        </div>
      </div>

      <div className="panel">
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Category</th><th>Course</th><th>Sem</th><th>Amount</th><th>Due Date</th><th>Year</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f._id}>
                  <td style={{ color:'var(--text-1)', fontWeight:500 }}>{f.fee_category}</td>
                  <td>{f.course}</td>
                  <td>{f.semester}</td>
                  <td style={{ fontFamily:'var(--font-serif)', color:'var(--gold-3)' }}>₹{f.amount?.toLocaleString('en-IN')}</td>
                  <td><span className="text-mono">{new Date(f.due_date).toLocaleDateString('en-IN')}</span></td>
                  <td><span className="text-mono">{f.academic_year}</span></td>
                  <td><span className={`badge ${f.status==='active'?'badge-paid':'badge-overdue'}`}>{f.status}</span></td>
                  <td style={{ textAlign:'right' }}>
                    <div className="flex-gap" style={{ justifyContent:'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(f)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}><i className="bi bi-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-card">
            <div className="modal-head">
              <span className="modal-title">{editId ? 'Edit Fee' : 'Add Fee Structure'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-grid-2">
                  <div className="form-field"><label className="form-label">Fee Category</label>
                    <input className="form-input" value={form.fee_category} onChange={e=>setForm(f=>({...f,fee_category:e.target.value}))} required /></div>
                  <div className="form-field"><label className="form-label">Amount (₹)</label>
                    <input className="form-input" type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} required /></div>
                  <div className="form-field"><label className="form-label">Course</label>
                    <input className="form-input" value={form.course} onChange={e=>setForm(f=>({...f,course:e.target.value}))} /></div>
                  <div className="form-field"><label className="form-label">Semester</label>
                    <input className="form-input" value={form.semester} onChange={e=>setForm(f=>({...f,semester:e.target.value}))} /></div>
                  <div className="form-field"><label className="form-label">Due Date</label>
                    <input className="form-input" type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} required /></div>
                  <div className="form-field"><label className="form-label">Academic Year</label>
                    <input className="form-input" value={form.academic_year} onChange={e=>setForm(f=>({...f,academic_year:e.target.value}))} /></div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Add Fee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
