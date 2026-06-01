import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Receipt() {
  const { receipt_no } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/student/receipt?receipt_no=${receipt_no}`)
      .then(r => setReceipt(r.data))
      .catch(err => setError(err.response?.data?.error || 'Receipt not found'));
  }, [receipt_no]);

  if (error) return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Student Portal</div>
        <div className="page-title">Receipt</div>
      </div>
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-ghost" onClick={() => navigate('/student/payment-history')}>← Back</button>
    </div>
  );

  if (!receipt) return <div className="center-loader"><div className="spinner-ring" /></div>;

  const { student_id: student, fee_id: fee, amount, payment_date, payment_method, transaction_ref } = receipt;

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-eyebrow">Student Portal</div>
            <div className="page-title">Payment Receipt</div>
          </div>
          <div className="flex-gap no-print">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/payment-history')}>← History</button>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <i className="bi bi-printer" /> Print
            </button>
          </div>
        </div>
      </div>

      <div className="receipt-wrap">
        <div className="receipt-header">
          <div className="receipt-uni">Pandit S. N. Shukla University, Shahdol</div>
          <div className="receipt-doc-type">Fee Payment Receipt</div>
        </div>

        <div className="receipt-body">
          <div className="receipt-meta">
            <div className="receipt-meta-item">
              <div className="receipt-meta-label">Receipt Number</div>
              <div className="receipt-meta-value">{receipt_no}</div>
            </div>
            <div className="receipt-meta-item" style={{ textAlign: 'right' }}>
              <div className="receipt-meta-label">Date</div>
              <div className="receipt-meta-value">
                {new Date(payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          <hr className="receipt-divider" />

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Student Details
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Name</span>
              <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{student?.name}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Roll Number</span>
              <span className="receipt-row-value">{student?.roll_no}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Course</span>
              <span className="receipt-row-value">{student?.course}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Semester</span>
              <span className="receipt-row-value">{student?.semester}</span>
            </div>
          </div>

          <hr className="receipt-divider" />

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Payment Details
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Fee Description</span>
              <span className="receipt-row-value">{fee?.fee_category}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Academic Year</span>
              <span className="receipt-row-value">{fee?.academic_year}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Payment Method</span>
              <span className="receipt-row-value" style={{ textTransform: 'capitalize' }}>{payment_method}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Transaction Ref.</span>
              <span className="text-mono">{transaction_ref}</span>
            </div>
          </div>

          <div className="receipt-total">
            <span className="receipt-total-label">Total Amount Paid</span>
            <span className="receipt-total-value">₹{amount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="receipt-footer">
          Computer-generated receipt — no signature required · fees.psnsu.ac.in
        </div>
      </div>
    </div>
  );
}
