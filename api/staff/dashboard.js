import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import PaymentTransaction from '../../models/PaymentTransaction.js'

export default async function handler(req, res) {
  try {
    const payload = requireRole(req, 'staff', 'administrator')
    await connectDB()
    const [todayTotal, recentTxns, totalCount] = await Promise.all([
      PaymentTransaction.aggregate([
        { $match: { payment_date: { $gte: new Date(new Date().setHours(0,0,0,0)) } } },
        { $group: { _id: null, total: { $sum: '$amount_paid' } } }
      ]),
      PaymentTransaction.find().sort({ createdAt: -1 }).limit(10)
        .populate('student_id', 'name roll_no')
        .populate('fee_id', 'fee_category'),
      PaymentTransaction.countDocuments(),
    ])
    res.json({ todayTotal: todayTotal[0]?.total || 0, recentTxns, totalCount })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
