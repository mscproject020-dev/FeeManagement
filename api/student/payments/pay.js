import { connectDB } from '../../../lib/db.js'
import { requireRole, setCors } from '../../../lib/middleware.js'
import PaymentTransaction from '../../../models/PaymentTransaction.js'
import FeeStructure from '../../../models/FeeStructure.js'
import Student from '../../../models/Student.js'

function generateReceiptNo() {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `REC-${dateStr}-${rand}`
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await connectDB()
    const decoded = requireRole(req, 'student')

    const { fee_id, payment_method } = req.body

    if (!fee_id || !payment_method) {
      return res.status(400).json({ error: 'fee_id and payment_method are required' })
    }

    const fee = await FeeStructure.findById(fee_id)
    if (!fee) return res.status(404).json({ error: 'Fee not found' })

    const student = await Student.findById(decoded.id)
    if (!student) return res.status(404).json({ error: 'Student not found' })

    // Verify this fee applies to the student
    if (fee.course !== student.course || fee.semester !== student.semester) {
      return res.status(403).json({ error: 'This fee does not apply to your course/semester' })
    }

    // Check if already paid
    const existing = await PaymentTransaction.findOne({ student_id: decoded.id, fee_id, status: 'paid' })
    if (existing) return res.status(409).json({ error: 'This fee has already been paid', receipt_no: existing.receipt_no })

    const receipt_no = generateReceiptNo()
    const transaction_ref = `TXN${Date.now()}`

    const payment = await PaymentTransaction.create({
      student_id: decoded.id,
      fee_id,
      amount_paid: fee.amount,
      payment_date: new Date(),
      payment_method,
      transaction_ref,
      receipt_no,
      status: 'paid'
    })

    return res.status(201).json({ payment, receipt_no })
  } catch (err) {
    if (err.message === 'Forbidden' || err.message === 'No token') {
      return res.status(403).json({ error: err.message })
    }
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
