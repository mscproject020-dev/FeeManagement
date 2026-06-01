import mongoose from 'mongoose'

const feeSchema = new mongoose.Schema({
  course:         { type: String, required: true },
  semester:       { type: Number, required: true },
  fee_category:   { type: String, required: true },
  amount:         { type: Number, required: true },
  due_date:       { type: Date, required: true },
  academic_year:  { type: String, default: '2025-26' },
  status:         { type: String, enum: ['active','inactive'], default: 'active' },
}, { timestamps: true })

export default mongoose.models.FeeStructure || mongoose.model('FeeStructure', feeSchema)
