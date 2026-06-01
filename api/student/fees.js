import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import Student from '../../models/Student.js'
import FeeStructure from '../../models/FeeStructure.js'
import PaymentTransaction from '../../models/PaymentTransaction.js'

export default async function handler(req, res) {
  try {
    const payload = requireRole(req, 'student')
    await connectDB()
    const student = await Student.findById(payload.id)
    const fees = await FeeStructure.find({ course: student.course, semester: student.semester, status: 'active' })
    const paid = await PaymentTransaction.find({ student_id: payload.id, status: 'paid' }).select('fee_id receipt_no amount_paid payment_date')
    const paidMap = {}
    paid.forEach(p => { paidMap[p.fee_id.toString()] = p })
    const result = fees.map(f => ({
      ...f.toObject(),
      paid: !!paidMap[f._id.toString()],
      txn: paidMap[f._id.toString()] || null,
    }))
    res.json(result)
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
