import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const studentSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  roll_no:    { type: String, required: true, unique: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  course:     { type: String, default: 'M.Sc. Computer Science' },
  semester:   { type: Number, default: 1 },
  phone:      { type: String, default: '' },
  address:    { type: String, default: '' },
  status:     { type: String, enum: ['active','inactive'], default: 'active' },
}, { timestamps: true })

studentSchema.pre('save', async function(next) {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12)
  next()
})

studentSchema.methods.comparePassword = function(p) {
  return bcrypt.compare(p, this.password)
}

export default mongoose.models.Student || mongoose.model('Student', studentSchema)
