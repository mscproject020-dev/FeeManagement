import { connectDB } from '../../../lib/db.js'
import { requireRole, setCors } from '../../../lib/middleware.js'
import PaymentTransaction from '../../../models/PaymentTransaction.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await connectDB()
    const decoded = requireRole(req, 'student')

    const payments = await PaymentTransaction.find({ student_id: decoded.id })
      .sort({ payment_date: -1 })
      .populate('fee_id', 'fee_category amount course semester academic_year')

    return res.status(200).json({ payments })
  } catch (err) {
    if (err.message === 'Forbidden' || err.message === 'No token') {
      return res.status(403).json({ error: err.message })
    }
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
