import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import PaymentTransaction from '../../models/PaymentTransaction.js'

export default async function handler(req, res) {
  try {
    const payload = requireRole(req, 'student')
    await connectDB()
    const { receipt_no } = req.query
    const txn = await PaymentTransaction.findOne({ receipt_no, student_id: payload.id })
      .populate('student_id', 'name roll_no course semester email')
      .populate('fee_id', 'fee_category amount academic_year')
    if (!txn) return res.status(404).json({ error: 'Receipt not found' })
    res.json(txn)
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
