import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import PaymentTransaction from '../../models/PaymentTransaction.js'
import Student from '../../models/Student.js'
import FeeStructure from '../../models/FeeStructure.js'

export default async function handler(req, res) {
  try {
    const payload = requireRole(req, 'staff', 'administrator')
    await connectDB()

    if (req.method === 'GET') {
      const txns = await PaymentTransaction.find()
        .populate('student_id', 'name roll_no course semester')
        .populate('fee_id', 'fee_category amount')
        .sort({ createdAt: -1 })
      return res.json(txns)
    }

    if (req.method === 'POST') {
      // Staff records cash/DD payment for a student
      const { student_id, fee_id, amount_paid, payment_method } = req.body
      const txn = new PaymentTransaction({
        student_id, fee_id, amount_paid,
        payment_method: payment_method || 'cash',
        processed_by: payload.id,
      })
      await txn.save()
      return res.status(201).json({ message: 'Payment recorded', receipt_no: txn.receipt_no })
    }
    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
