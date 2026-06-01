import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import PaymentTransaction from '../../models/PaymentTransaction.js'
import FeeStructure from '../../models/FeeStructure.js'

export default async function handler(req, res) {
  try {
    const payload = requireRole(req, 'student')
    await connectDB()

    if (req.method === 'GET') {
      const txns = await PaymentTransaction.find({ student_id: payload.id })
        .populate('fee_id', 'fee_category amount academic_year')
        .sort({ createdAt: -1 })
      return res.json(txns)
    }

    if (req.method === 'POST') {
      const { fee_id, payment_method, card_no } = req.body
      const fee = await FeeStructure.findById(fee_id)
      if (!fee) return res.status(404).json({ error: 'Fee not found' })
      const already = await PaymentTransaction.findOne({ student_id: payload.id, fee_id, status: 'paid' })
      if (already) return res.status(400).json({ error: 'Already paid', receipt_no: already.receipt_no })
      const txn = new PaymentTransaction({
        student_id: payload.id,
        fee_id,
        amount_paid: fee.amount,
        payment_method: payment_method || 'online',
      })
      await txn.save()
      return res.status(201).json({ message: 'Payment successful', receipt_no: txn.receipt_no })
    }
    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
