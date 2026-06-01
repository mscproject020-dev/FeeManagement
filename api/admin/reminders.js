import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import FeeReminder from '../../models/FeeReminder.js'
import Student from '../../models/Student.js'
import FeeStructure from '../../models/FeeStructure.js'
import PaymentTransaction from '../../models/PaymentTransaction.js'

export default async function handler(req, res) {
  try {
    requireRole(req, 'administrator', 'staff')
    await connectDB()

    if (req.method === 'GET') {
      const reminders = await FeeReminder.find()
        .populate('student_id', 'name roll_no email')
        .populate('fee_id', 'fee_category amount due_date')
        .sort({ createdAt: -1 })
      return res.json(reminders)
    }

    if (req.method === 'POST') {
      // Find students with unpaid fees and create reminders
      const fees = await FeeStructure.find({ status: 'active' })
      const students = await Student.find({ status: 'active' })
      const paid = await PaymentTransaction.find({ status: 'paid' }).select('student_id fee_id')
      const paidSet = new Set(paid.map(p => `${p.student_id}_${p.fee_id}`))

      let created = 0
      for (const s of students) {
        for (const f of fees) {
          if (s.course === f.course && s.semester === f.semester &&
              !paidSet.has(`${s._id}_${f._id}`)) {
            await FeeReminder.create({
              student_id: s._id, fee_id: f._id,
              message: `Dear ${s.name}, your ${f.fee_category} of ₹${f.amount} is due. Please pay before ${new Date(f.due_date).toLocaleDateString()}.`,
            })
            created++
          }
        }
      }
      return res.json({ message: `${created} reminders sent` })
    }
    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
