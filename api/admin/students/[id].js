import { connectDB } from '../../../lib/db.js'
import { requireRole, setCors } from '../../../lib/middleware.js'
import Student from '../../../models/Student.js'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    await connectDB()
    requireRole(req, 'administrator', 'staff')

    const { id } = req.query

    if (req.method === 'GET') {
      const student = await Student.findById(id).select('-password')
      if (!student) return res.status(404).json({ error: 'Student not found' })
      return res.status(200).json({ student })
    }

    if (req.method === 'PUT') {
      const { name, course, semester, phone, address, status, password } = req.body
      const update = { name, course, semester: parseInt(semester), phone, address, status }
      if (password) {
        update.password = await bcrypt.hash(password, 10)
      }
      const student = await Student.findByIdAndUpdate(id, update, { new: true }).select('-password')
      if (!student) return res.status(404).json({ error: 'Student not found' })
      return res.status(200).json({ student })
    }

    if (req.method === 'DELETE') {
      const student = await Student.findByIdAndUpdate(id, { status: 'inactive' }, { new: true }).select('-password')
      if (!student) return res.status(404).json({ error: 'Student not found' })
      return res.status(200).json({ message: 'Student deactivated', student })
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
