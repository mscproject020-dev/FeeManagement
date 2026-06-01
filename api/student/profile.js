import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import Student from '../../models/Student.js'

export default async function handler(req, res) {
  try {
    const payload = requireRole(req, 'student')
    await connectDB()
    if (req.method === 'GET') {
      const s = await Student.findById(payload.id).select('-password')
      return res.json(s)
    }
    if (req.method === 'PUT') {
      const { phone, address, name } = req.body
      await Student.findByIdAndUpdate(payload.id, { phone, address, name })
      return res.json({ message: 'Profile updated' })
    }
    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
