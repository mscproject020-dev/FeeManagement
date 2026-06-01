import { connectDB } from '../../../lib/db.js'
import { requireRole, setCors } from '../../../lib/middleware.js'
import FeeStructure from '../../../models/FeeStructure.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    await connectDB()

    if (req.method === 'GET') {
      requireRole(req, 'administrator', 'staff')
      const fees = await FeeStructure.find().sort({ course: 1, semester: 1 }).populate('created_by', 'name')
      return res.status(200).json({ fees })
    }

    if (req.method === 'POST') {
      const user = requireRole(req, 'administrator')
      const { course, semester, fee_category, amount, due_date, academic_year } = req.body

      if (!course || !semester || !fee_category || !amount || !due_date) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      const fee = await FeeStructure.create({
        course, semester: parseInt(semester), fee_category, amount: parseFloat(amount),
        due_date: new Date(due_date), academic_year: academic_year || '2025-26',
        created_by: user.id
      })

      return res.status(201).json({ fee })
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
