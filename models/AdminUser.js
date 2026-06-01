import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['administrator','staff'], default: 'staff' },
  status:   { type: String, enum: ['active','inactive'], default: 'active' },
}, { timestamps: true })

adminSchema.pre('save', async function(next) {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12)
  next()
})

adminSchema.methods.comparePassword = function(p) {
  return bcrypt.compare(p, this.password)
}

export default mongoose.models.AdminUser || mongoose.model('AdminUser', adminSchema)
