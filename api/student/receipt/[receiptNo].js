import { connectDB } from '../../../lib/db.js'
import { requireRole, setCors } from '../../../lib/middleware.js'
import PaymentTransaction from '../../../models/PaymentTransaction.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await connectDB()
    const decoded = requireRole(req, 'student', 'administrator', 'staff')

    const { receiptNo } = req.query

    const payment = await PaymentTransaction.findOne({ receipt_no: receiptNo })
      .populate('student_id', 'name roll_no email course semester phone address')
      .populate('fee_id', 'fee_category amount course semester academic_year due_date')
      .populate('processed_by', 'name')

    if (!payment) return res.status(404).json({ error: 'Receipt not found' })

    // Students can only view their own receipts
    if (decoded.role === 'student' && payment.student_id._id.toString() !== decoded.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    return res.status(200).json({ receipt: payment })
  } catch (err) {
    if (err.message === 'Forbidden' || err.message === 'No token') {
      return res.status(403).json({ error: err.message })
    }
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
