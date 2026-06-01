import { connectDB } from '../../../lib/db.js'
import { requireRole, setCors } from '../../../lib/middleware.js'
import Student from '../../../models/Student.js'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    await connectDB()

    if (req.method === 'GET') {
      requireRole(req, 'administrator', 'staff')
      const page = parseInt(req.query?.page) || 1
      const limit = parseInt(req.query?.limit) || 20
      const search = req.query?.search || ''
      const skip = (page - 1) * limit

      const query = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { roll_no: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          }
        : {}

      const [students, total] = await Promise.all([
        Student.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
        Student.countDocuments(query)
      ])

      return res.status(200).json({ students, total, page, pages: Math.ceil(total / limit) })
    }

    if (req.method === 'POST') {
      // Allow public registration or admin creation
      const { name, roll_no, email, password, course, semester, phone, address } = req.body

      if (!name || !roll_no || !email || !password || !course || !semester) {
        return res.status(400).json({ error: 'All required fields must be provided' })
      }

      const existing = await Student.findOne({ $or: [{ email }, { roll_no }] })
      if (existing) return res.status(409).json({ error: 'Student with this email or roll number already exists' })

      const hashed = await bcrypt.hash(password, 10)
      const student = await Student.create({
        name, roll_no, email: email.toLowerCase(), password: hashed,
        course, semester: parseInt(semester), phone, address
      })

      return res.status(201).json({ student: { ...student.toObject(), password: undefined } })
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
