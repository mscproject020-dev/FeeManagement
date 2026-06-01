import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import Student from '../../models/Student.js'
import FeeStructure from '../../models/FeeStructure.js'
import PaymentTransaction from '../../models/PaymentTransaction.js'

export default async function handler(req, res) {
  try {
    const payload = requireRole(req, 'student')
    await connectDB()
    const [student, paid, fees] = await Promise.all([
      Student.findById(payload.id).select('-password'),
      PaymentTransaction.find({ student_id: payload.id, status: 'paid' }).select('fee_id amount_paid'),
      FeeStructure.find({ course: 'M.Sc. Computer Science', status: 'active' }),
    ])
    const paidFeeIds = new Set(paid.map(p => p.fee_id.toString()))
    const pending = fees.filter(f => !paidFeeIds.has(f._id.toString()))
    const totalPaid = paid.reduce((s, p) => s + p.amount_paid, 0)
    const totalDue  = pending.reduce((s, f) => s + f.amount, 0)
    res.json({ student, totalPaid, totalDue, pendingCount: pending.length })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
