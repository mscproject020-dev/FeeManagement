import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import Student from '../../models/Student.js'

export default async function handler(req, res) {
  try {
    requireRole(req, 'administrator', 'staff')
    await connectDB()

    if (req.method === 'GET') {
      const students = await Student.find().select('-password').sort({ createdAt: -1 })
      return res.json(students)
    }
    if (req.method === 'POST') {
      const student = new Student(req.body)
      await student.save()
      return res.status(201).json({ message: 'Student created', id: student._id })
    }
    if (req.method === 'PUT') {
      const { id, ...data } = req.body
      if (data.password) delete data.password  // prevent accidental hash bypass
      await Student.findByIdAndUpdate(id, data)
      return res.json({ message: 'Updated' })
    }
    if (req.method === 'DELETE') {
      const { id } = req.query
      await Student.findByIdAndUpdate(id, { status: 'inactive' })
      return res.json({ message: 'Deactivated' })
    }
    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
