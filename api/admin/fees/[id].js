import { connectDB } from '../../../lib/db.js'
import { requireRole, setCors } from '../../../lib/middleware.js'
import FeeStructure from '../../../models/FeeStructure.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    await connectDB()
    requireRole(req, 'administrator')

    const { id } = req.query

    if (req.method === 'GET') {
      const fee = await FeeStructure.findById(id).populate('created_by', 'name')
      if (!fee) return res.status(404).json({ error: 'Fee structure not found' })
      return res.status(200).json({ fee })
    }

    if (req.method === 'PUT') {
      const { course, semester, fee_category, amount, due_date, academic_year } = req.body
      const fee = await FeeStructure.findByIdAndUpdate(
        id,
        { course, semester: parseInt(semester), fee_category, amount: parseFloat(amount), due_date: new Date(due_date), academic_year },
        { new: true }
      )
      if (!fee) return res.status(404).json({ error: 'Fee structure not found' })
      return res.status(200).json({ fee })
    }

    if (req.method === 'DELETE') {
      const fee = await FeeStructure.findByIdAndDelete(id)
      if (!fee) return res.status(404).json({ error: 'Fee structure not found' })
      return res.status(200).json({ message: 'Fee structure deleted' })
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
