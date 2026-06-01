import { useState, useEffect } from 'react';
import axios from 'axios';

const empty = { name:'', roll_no:'', email:'', password:'', course:'M.Sc. CS', semester:'4', phone:'', address:'' };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => axios.get('/api/admin/students').then(r => setStudents(r.data));
  useEffect(() => { load(); }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(q.toLowerCase()) ||
    s.email.toLowerCase().includes(q.toLowerCase())
  );

  const openAdd  = () => { setForm(empty); setEditId(null); setError(''); setModal(true); };
  const openEdit = (s) => { setForm({ ...s, password: '' }); setEditId(s._id); setError(''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editId) await axios.put('/api/admin/students', { ...form, id: editId });
      else        await axios.post('/api/admin/students', form);
      setModal(false); load();
    } catch(err) { setError(err.response?.data?.error || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this student?')) return;
    await axios.delete(`/api/admin/students?id=${id}`);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-eyebrow">Administration</div>
            <div className="page-title">Students</div>
            <div className="page-sub">{students.length} registered students</div>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="bi bi-plus-lg" /> Add Student
          </button>
        </div>
      </div>

      <div className="search-bar">
        <i className="bi bi-search search-icon" />
        <input placeholder="Search by name, roll no. or email…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="panel">
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Roll No.</th><th>Email</th><th>Course</th><th>Sem</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td style={{ color:'var(--text-1)', fontWeight:500 }}>{s.name}</td>
                  <td><span className="text-mono">{s.roll_no}</span></td>
                  <td style={{ color:'var(--text-3)', fontSize:12 }}>{s.email}</td>
                  <td>{s.course}</td>
                  <td>{s.semester}</td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-paid' : 'badge-overdue'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ textAlign:'right' }}>
                    <div className="flex-gap" style={{ justifyContent:'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
                        <i className="bi bi-trash" />
                      </button>
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
              <span className="modal-title">{editId ? 'Edit Student' : 'Add Student'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-grid-2">
                  <div className="form-field"><label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required /></div>
                  <div className="form-field"><label className="form-label">Roll No.</label>
                    <input className="form-input" value={form.roll_no} onChange={e=>setForm(f=>({...f,roll_no:e.target.value}))} required /></div>
                  <div className="form-field"><label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required /></div>
                  <div className="form-field"><label className="form-label">Password {editId && <span style={{color:'var(--text-3)'}}>(leave blank to keep)</span>}</label>
                    <input className="form-input" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} /></div>
                  <div className="form-field"><label className="form-label">Course</label>
                    <input className="form-input" value={form.course} onChange={e=>setForm(f=>({...f,course:e.target.value}))} /></div>
                  <div className="form-field"><label className="form-label">Semester</label>
                    <input className="form-input" value={form.semester} onChange={e=>setForm(f=>({...f,semester:e.target.value}))} /></div>
                  <div className="form-field"><label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></div>
                  <div className="form-field"><label className="form-label">Address</label>
                    <input className="form-input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} /></div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Update' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
