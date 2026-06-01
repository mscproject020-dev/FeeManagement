import { connectDB } from '../../lib/db.js'
import Student from '../../models/Student.js'
import AdminUser from '../../models/AdminUser.js'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  await connectDB()
  const { email, password, role } = req.body

  try {
    let user
    if (role === 'student') {
      user = await Student.findOne({ email, status: 'active' })
    } else {
      user = await AdminUser.findOne({ email, status: 'active' })
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const userRole = role === 'student' ? 'student' : user.role
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: userRole } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
