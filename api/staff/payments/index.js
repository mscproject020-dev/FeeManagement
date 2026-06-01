import { connectDB } from '../../../lib/db.js'
import { requireRole, setCors } from '../../../lib/middleware.js'
import PaymentTransaction from '../../../models/PaymentTransaction.js'
import Student from '../../../models/Student.js'
import FeeStructure from '../../../models/FeeStructure.js'

function generateReceiptNo() {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `REC-${dateStr}-${rand}`
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    await connectDB()
    const user = requireRole(req, 'administrator', 'staff')

    if (req.method === 'GET') {
      const page = parseInt(req.query?.page) || 1
      const limit = parseInt(req.query?.limit) || 20
      const skip = (page - 1) * limit

      const [payments, total] = await Promise.all([
        PaymentTransaction.find()
          .sort({ payment_date: -1 })
          .skip(skip)
          .limit(limit)
          .populate('student_id', 'name roll_no email')
          .populate('fee_id', 'fee_category amount course semester')
          .populate('processed_by', 'name'),
        PaymentTransaction.countDocuments()
      ])

      return res.status(200).json({ payments, total, page, pages: Math.ceil(total / limit) })
    }

    if (req.method === 'POST') {
      const { student_id, fee_id, amount_paid, payment_method, transaction_ref } = req.body

      if (!student_id || !fee_id || !amount_paid || !payment_method) {
        return res.status(400).json({ error: 'All required fields must be provided' })
      }

      const [student, fee] = await Promise.all([
        Student.findById(student_id),
        FeeStructure.findById(fee_id)
      ])

      if (!student) return res.status(404).json({ error: 'Student not found' })
      if (!fee) return res.status(404).json({ error: 'Fee structure not found' })

      // Check if already paid
      const existing = await PaymentTransaction.findOne({ student_id, fee_id, status: 'paid' })
      if (existing) return res.status(409).json({ error: 'Fee already paid for this student' })

      const receipt_no = generateReceiptNo()
      const payment = await PaymentTransaction.create({
        student_id, fee_id,
        amount_paid: parseFloat(amount_paid),
        payment_method,
        transaction_ref: transaction_ref || '',
        receipt_no,
        status: 'paid',
        payment_date: new Date(),
        processed_by: user.id
      })

      return res.status(201).json({ payment, receipt_no })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    if (err.message === 'Forbidden' || err.message === 'No token') {
      return res.status(403).json({ error: err.message })
    }
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
