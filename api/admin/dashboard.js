import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import Student from '../../models/Student.js'
import PaymentTransaction from '../../models/PaymentTransaction.js'
import FeeReminder from '../../models/FeeReminder.js'

export default async function handler(req, res) {
  try {
    requireRole(req, 'administrator')
    await connectDB()
    const [totalStudents, totalRevenue, recentTxns, pendingReminders] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      PaymentTransaction.aggregate([{ $group: { _id: null, total: { $sum: '$amount_paid' } } }]),
      PaymentTransaction.find().sort({ createdAt: -1 }).limit(5)
        .populate('student_id', 'name roll_no')
        .populate('fee_id', 'fee_category'),
      FeeReminder.countDocuments({ status: 'pending' }),
    ])
    res.json({
      totalStudents,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentTxns,
      pendingReminders,
    })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
