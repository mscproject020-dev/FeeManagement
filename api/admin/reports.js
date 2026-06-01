import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import PaymentTransaction from '../../models/PaymentTransaction.js'

export default async function handler(req, res) {
  try {
    requireRole(req, 'administrator')
    await connectDB()
    const { from, to } = req.query
    const filter = {}
    if (from || to) {
      filter.payment_date = {}
      if (from) filter.payment_date.$gte = new Date(from)
      if (to)   filter.payment_date.$lte = new Date(to)
    }
    const txns = await PaymentTransaction.find(filter)
      .populate('student_id', 'name roll_no course semester')
      .populate('fee_id', 'fee_category amount')
      .sort({ payment_date: -1 })
    const total = txns.reduce((s, t) => s + t.amount_paid, 0)
    res.json({ txns, total, count: txns.length })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
