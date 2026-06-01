import { connectDB } from '../../lib/db.js'
import { verifyToken } from '../../lib/auth.js'
import Student from '../../models/Student.js'
import AdminUser from '../../models/AdminUser.js'

export default async function handler(req, res) {
  try {
    const payload = verifyToken(req)
    await connectDB()
    let user
    if (payload.role === 'student') {
      user = await Student.findById(payload.id).select('-password')
    } else {
      user = await AdminUser.findById(payload.id).select('-password')
    }
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: { ...user.toObject(), role: payload.role } })
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
}
