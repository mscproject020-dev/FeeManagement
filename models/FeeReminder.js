import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema({
  student_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fee_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  message:       { type: String, default: '' },
  reminder_date: { type: Date, default: Date.now },
  status:        { type: String, enum: ['sent','pending'], default: 'sent' },
}, { timestamps: true })

export default mongoose.models.FeeReminder || mongoose.model('FeeReminder', reminderSchema)
