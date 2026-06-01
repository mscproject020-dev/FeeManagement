import { connectDB } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'
import FeeStructure from '../../models/FeeStructure.js'

export default async function handler(req, res) {
  try {
    requireRole(req, 'administrator')
    await connectDB()

    if (req.method === 'GET') {
      const fees = await FeeStructure.find().sort({ createdAt: -1 })
      return res.json(fees)
    }
    if (req.method === 'POST') {
      const fee = new FeeStructure(req.body)
      await fee.save()
      return res.status(201).json({ message: 'Fee created', id: fee._id })
    }
    if (req.method === 'PUT') {
      const { id, ...data } = req.body
      await FeeStructure.findByIdAndUpdate(id, data)
      return res.json({ message: 'Updated' })
    }
    if (req.method === 'DELETE') {
      const { id } = req.query
      await FeeStructure.findByIdAndUpdate(id, { status: 'inactive' })
      return res.json({ message: 'Deleted' })
    }
    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(err.message === 'Forbidden' ? 403 : 500).json({ error: err.message })
  }
}
