import mongoose from 'mongoose'

const txnSchema = new mongoose.Schema({
  student_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fee_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  amount_paid:     { type: Number, required: true },
  payment_date:    { type: Date, default: Date.now },
  payment_method:  { type: String, enum: ['online','cash','dd','neft'], default: 'online' },
  transaction_ref: { type: String, unique: true },
  receipt_no:      { type: String, unique: true },
  status:          { type: String, enum: ['paid','pending','failed'], default: 'paid' },
  processed_by:    { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
}, { timestamps: true })

txnSchema.pre('save', function(next) {
  if (!this.receipt_no) {
    const d = new Date()
    const ymd = d.toISOString().slice(0,10).replace(/-/g,'')
    this.receipt_no = `REC-${ymd}-${String(Math.floor(Math.random()*999999)).padStart(6,'0')}`
  }
  if (!this.transaction_ref) {
    this.transaction_ref = 'TXN' + Math.random().toString(36).substr(2,16).toUpperCase()
  }
  next()
})

export default mongoose.models.PaymentTransaction || mongoose.model('PaymentTransaction', txnSchema)
