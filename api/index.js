import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { connectDB } from '../lib/db.js'
import Student from '../models/Student.js'
import AdminUser from '../models/AdminUser.js'
import FeeStructure from '../models/FeeStructure.js'
import PaymentTransaction from '../models/PaymentTransaction.js'
import FeeReminder from '../models/FeeReminder.js'

const app = express()

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  next()
})

// Connect DB before every request
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' })
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
function verifyToken(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) throw new Error('No token')
  return jwt.verify(token, process.env.JWT_SECRET)
}

function requireRole(req, ...roles) {
  const user = verifyToken(req)
  if (!roles.includes(user.role)) throw new Error('Forbidden')
  return user
}

function handleErr(err, res) {
  const msg = err.message
  if (msg === 'Forbidden' || msg === 'No token' || msg === 'jwt expired' || msg === 'invalid token') {
    return res.status(403).json({ error: msg })
  }
  console.error(err)
  return res.status(500).json({ error: 'Server error' })
}

function generateReceiptNo() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `REC-${dateStr}-${rand}`
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
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
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const payload = verifyToken(req)
    let user
    if (payload.role === 'student') {
      user = await Student.findById(payload.id).select('-password')
    } else {
      user = await AdminUser.findById(payload.id).select('-password')
    }
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: { ...user.toObject(), role: payload.role } })
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
})

// ─── STUDENT ──────────────────────────────────────────────────────────────────

app.get('/api/student/dashboard', async (req, res) => {
  try {
    const payload = requireRole(req, 'student')
    const [student, paid, fees] = await Promise.all([
      Student.findById(payload.id).select('-password'),
      PaymentTransaction.find({ student_id: payload.id, status: 'paid' }).select('fee_id amount_paid'),
      FeeStructure.find({ status: 'active' }),
    ])
    const paidFeeIds = new Set(paid.map(p => p.fee_id.toString()))
    const relevantFees = fees.filter(f => f.course === student.course && f.semester === student.semester)
    const pending = relevantFees.filter(f => !paidFeeIds.has(f._id.toString()))
    const totalPaid = paid.reduce((s, p) => s + p.amount_paid, 0)
    const totalDue = pending.reduce((s, f) => s + f.amount, 0)
    res.json({ student, totalPaid, totalDue, pendingCount: pending.length })
  } catch (err) { handleErr(err, res) }
})

app.get('/api/student/fees', async (req, res) => {
  try {
    const payload = requireRole(req, 'student')
    const student = await Student.findById(payload.id)
    const fees = await FeeStructure.find({ course: student.course, semester: student.semester, status: 'active' })
    const paid = await PaymentTransaction.find({ student_id: payload.id, status: 'paid' })
      .select('fee_id receipt_no amount_paid payment_date')
    const paidMap = {}
    paid.forEach(p => { paidMap[p.fee_id.toString()] = p })
    const result = fees.map(f => ({
      ...f.toObject(),
      paid: !!paidMap[f._id.toString()],
      txn: paidMap[f._id.toString()] || null,
    }))
    res.json(result)
  } catch (err) { handleErr(err, res) }
})

app.get('/api/student/payments', async (req, res) => {
  try {
    const payload = requireRole(req, 'student')
    const payments = await PaymentTransaction.find({ student_id: payload.id })
      .sort({ payment_date: -1 })
      .populate('fee_id', 'fee_category amount course semester academic_year')
    res.json({ payments })
  } catch (err) { handleErr(err, res) }
})

// IMPORTANT: specific route before param route
app.post('/api/student/payments/pay', async (req, res) => {
  try {
    const decoded = requireRole(req, 'student')
    const { fee_id, payment_method } = req.body
    if (!fee_id || !payment_method) {
      return res.status(400).json({ error: 'fee_id and payment_method are required' })
    }
    const [fee, student] = await Promise.all([
      FeeStructure.findById(fee_id),
      Student.findById(decoded.id)
    ])
    if (!fee) return res.status(404).json({ error: 'Fee not found' })
    if (!student) return res.status(404).json({ error: 'Student not found' })
    if (fee.course !== student.course || fee.semester !== student.semester) {
      return res.status(403).json({ error: 'This fee does not apply to your course/semester' })
    }
    const existing = await PaymentTransaction.findOne({ student_id: decoded.id, fee_id, status: 'paid' })
    if (existing) return res.status(409).json({ error: 'This fee has already been paid', receipt_no: existing.receipt_no })
    const receipt_no = generateReceiptNo()
    const payment = await PaymentTransaction.create({
      student_id: decoded.id, fee_id,
      amount_paid: fee.amount,
      payment_date: new Date(),
      payment_method,
      transaction_ref: `TXN${Date.now()}`,
      receipt_no,
      status: 'paid'
    })
    res.status(201).json({ payment, receipt_no })
  } catch (err) { handleErr(err, res) }
})

app.get('/api/student/profile', async (req, res) => {
  try {
    const payload = requireRole(req, 'student')
    const s = await Student.findById(payload.id).select('-password')
    res.json(s)
  } catch (err) { handleErr(err, res) }
})

app.put('/api/student/profile', async (req, res) => {
  try {
    const payload = requireRole(req, 'student')
    const { phone, address, name } = req.body
    await Student.findByIdAndUpdate(payload.id, { phone, address, name })
    res.json({ message: 'Profile updated' })
  } catch (err) { handleErr(err, res) }
})

app.get('/api/student/receipt/:receiptNo', async (req, res) => {
  try {
    const decoded = requireRole(req, 'student', 'administrator', 'staff')
    const payment = await PaymentTransaction.findOne({ receipt_no: req.params.receiptNo })
      .populate('student_id', 'name roll_no email course semester phone address')
      .populate('fee_id', 'fee_category amount course semester academic_year due_date')
      .populate('processed_by', 'name')
    if (!payment) return res.status(404).json({ error: 'Receipt not found' })
    if (decoded.role === 'student' && payment.student_id._id.toString() !== decoded.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    res.json({ receipt: payment })
  } catch (err) { handleErr(err, res) }
})

// ─── ADMIN ────────────────────────────────────────────────────────────────────

app.get('/api/admin/dashboard', async (req, res) => {
  try {
    requireRole(req, 'administrator')
    const [totalStudents, totalRevenue, recentTxns, pendingReminders] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      PaymentTransaction.aggregate([{ $group: { _id: null, total: { $sum: '$amount_paid' } } }]),
      PaymentTransaction.find().sort({ createdAt: -1 }).limit(5)
        .populate('student_id', 'name roll_no')
        .populate('fee_id', 'fee_category'),
      FeeReminder.countDocuments({ status: 'pending' }),
    ])
    res.json({
      totalStudents,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentTxns,
      pendingReminders,
    })
  } catch (err) { handleErr(err, res) }
})

app.get('/api/admin/fees', async (req, res) => {
  try {
    requireRole(req, 'administrator', 'staff')
    const fees = await FeeStructure.find().sort({ course: 1, semester: 1 })
    res.json({ fees })
  } catch (err) { handleErr(err, res) }
})

app.post('/api/admin/fees', async (req, res) => {
  try {
    const user = requireRole(req, 'administrator')
    const { course, semester, fee_category, amount, due_date, academic_year } = req.body
    if (!course || !semester || !fee_category || !amount || !due_date) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    const fee = await FeeStructure.create({
      course,
      semester: parseInt(semester),
      fee_category,
      amount: parseFloat(amount),
      due_date: new Date(due_date),
      academic_year: academic_year || '2025-26',
    })
    res.status(201).json({ fee })
  } catch (err) { handleErr(err, res) }
})

app.put('/api/admin/fees/:id', async (req, res) => {
  try {
    requireRole(req, 'administrator')
    const { course, semester, fee_category, amount, due_date, academic_year } = req.body
    const fee = await FeeStructure.findByIdAndUpdate(
      req.params.id,
      { course, semester: parseInt(semester), fee_category, amount: parseFloat(amount), due_date: new Date(due_date), academic_year },
      { new: true }
    )
    if (!fee) return res.status(404).json({ error: 'Fee structure not found' })
    res.json({ fee })
  } catch (err) { handleErr(err, res) }
})

app.delete('/api/admin/fees/:id', async (req, res) => {
  try {
    requireRole(req, 'administrator')
    const fee = await FeeStructure.findByIdAndDelete(req.params.id)
    if (!fee) return res.status(404).json({ error: 'Fee structure not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { handleErr(err, res) }
})

app.get('/api/admin/students', async (req, res) => {
  try {
    requireRole(req, 'administrator', 'staff')
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''
    const skip = (page - 1) * limit
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { roll_no: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {}
    const [students, total] = await Promise.all([
      Student.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Student.countDocuments(query)
    ])
    res.json({ students, total, page, pages: Math.ceil(total / limit) })
  } catch (err) { handleErr(err, res) }
})

app.post('/api/admin/students', async (req, res) => {
  try {
    requireRole(req, 'administrator', 'staff')
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
    res.status(201).json({ student: { ...student.toObject(), password: undefined } })
  } catch (err) { handleErr(err, res) }
})

app.put('/api/admin/students/:id', async (req, res) => {
  try {
    requireRole(req, 'administrator', 'staff')
    const { name, course, semester, phone, address, status, password } = req.body
    const update = { name, course, semester: parseInt(semester), phone, address, status }
    if (password) update.password = await bcrypt.hash(password, 10)
    const student = await Student.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password')
    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json({ student })
  } catch (err) { handleErr(err, res) }
})

app.delete('/api/admin/students/:id', async (req, res) => {
  try {
    requireRole(req, 'administrator', 'staff')
    const student = await Student.findByIdAndUpdate(
      req.params.id, { status: 'inactive' }, { new: true }
    ).select('-password')
    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json({ message: 'Student deactivated', student })
  } catch (err) { handleErr(err, res) }
})

app.get('/api/admin/reminders', async (req, res) => {
  try {
    requireRole(req, 'administrator', 'staff')
    const reminders = await FeeReminder.find()
      .populate('student_id', 'name roll_no email')
      .populate('fee_id', 'fee_category amount due_date')
      .sort({ createdAt: -1 })
    res.json(reminders)
  } catch (err) { handleErr(err, res) }
})

app.post('/api/admin/reminders', async (req, res) => {
  try {
    requireRole(req, 'administrator', 'staff')
    const [fees, students, paid] = await Promise.all([
      FeeStructure.find({ status: 'active' }),
      Student.find({ status: 'active' }),
      PaymentTransaction.find({ status: 'paid' }).select('student_id fee_id')
    ])
    const paidSet = new Set(paid.map(p => `${p.student_id}_${p.fee_id}`))
    let created = 0
    for (const s of students) {
      for (const f of fees) {
        if (s.course === f.course && s.semester === f.semester && !paidSet.has(`${s._id}_${f._id}`)) {
          await FeeReminder.create({
            student_id: s._id, fee_id: f._id,
            message: `Dear ${s.name}, your ${f.fee_category} of ₹${f.amount} is due. Please pay before ${new Date(f.due_date).toLocaleDateString()}.`,
          })
          created++
        }
      }
    }
    res.json({ message: `${created} reminders sent` })
  } catch (err) { handleErr(err, res) }
})

app.get('/api/admin/reports', async (req, res) => {
  try {
    requireRole(req, 'administrator')
    const { from, to } = req.query
    const filter = {}
    if (from || to) {
      filter.payment_date = {}
      if (from) filter.payment_date.$gte = new Date(from)
      if (to) filter.payment_date.$lte = new Date(to)
    }
    const txns = await PaymentTransaction.find(filter)
      .populate('student_id', 'name roll_no course semester')
      .populate('fee_id', 'fee_category amount')
      .sort({ payment_date: -1 })
    const total = txns.reduce((s, t) => s + t.amount_paid, 0)
    res.json({ txns, total, count: txns.length })
  } catch (err) { handleErr(err, res) }
})

// ─── STAFF ────────────────────────────────────────────────────────────────────

app.get('/api/staff/dashboard', async (req, res) => {
  try {
    requireRole(req, 'staff', 'administrator')
    const [todayTotal, recentTxns, totalCount] = await Promise.all([
      PaymentTransaction.aggregate([
        { $match: { payment_date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
        { $group: { _id: null, total: { $sum: '$amount_paid' } } }
      ]),
      PaymentTransaction.find().sort({ createdAt: -1 }).limit(10)
        .populate('student_id', 'name roll_no')
        .populate('fee_id', 'fee_category'),
      PaymentTransaction.countDocuments(),
    ])
    res.json({ todayTotal: todayTotal[0]?.total || 0, recentTxns, totalCount })
  } catch (err) { handleErr(err, res) }
})

app.get('/api/staff/payments', async (req, res) => {
  try {
    requireRole(req, 'staff', 'administrator')
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const [payments, total] = await Promise.all([
      PaymentTransaction.find()
        .sort({ payment_date: -1 }).skip(skip).limit(limit)
        .populate('student_id', 'name roll_no email')
        .populate('fee_id', 'fee_category amount course semester')
        .populate('processed_by', 'name'),
      PaymentTransaction.countDocuments()
    ])
    res.json({ payments, total, page, pages: Math.ceil(total / limit) })
  } catch (err) { handleErr(err, res) }
})

app.post('/api/staff/payments', async (req, res) => {
  try {
    const user = requireRole(req, 'staff', 'administrator')
    const { student_id, fee_id, amount_paid, payment_method, transaction_ref } = req.body
    if (!student_id || !fee_id || !amount_paid || !payment_method) {
      return res.status(400).json({ error: 'All required fields must be provided' })
    }
    const [student, fee] = await Promise.all([
      Student.findById(student_id),
      FeeStructure.findById(fee_id)
    ])
    if (!student) return res.status(404).json({ error: 'Student not found' })
    if (!fee) return res.status(404).json({ error: 'Fee structure not found' })
    const existing = await PaymentTransaction.findOne({ student_id, fee_id, status: 'paid' })
    if (existing) return res.status(409).json({ error: 'Fee already paid for this student' })
    const receipt_no = generateReceiptNo()
    const payment = await PaymentTransaction.create({
      student_id, fee_id,
      amount_paid: parseFloat(amount_paid),
      payment_method,
      transaction_ref: transaction_ref || `TXN${Date.now()}`,
      receipt_no, status: 'paid',
      payment_date: new Date(),
      processed_by: user.id
    })
    res.status(201).json({ payment, receipt_no })
  } catch (err) { handleErr(err, res) }
})

// ─── Seed endpoint (browser-accessible, one-time use) ─────────────────────────
app.post('/api/seed', async (req, res) => {
  const { secret } = req.body
  if (secret !== process.env.SEED_SECRET && secret !== 'psnsu_seed_2026') {
    return res.status(403).json({ error: 'Invalid seed secret' })
  }
  try {
    // Clear existing
    await Promise.all([
      AdminUser.deleteMany({}),
      Student.deleteMany({}),
      FeeStructure.deleteMany({}),
      PaymentTransaction.deleteMany({}),
      FeeReminder.deleteMany({})
    ])
    // Admin users
    const admin = await AdminUser.create({ name: 'Admin', email: 'admin@fees.com', password: await bcrypt.hash('admin123', 10), role: 'administrator' })
    await AdminUser.create({ name: 'Priya Sharma', email: 'priya@fees.com', password: await bcrypt.hash('staff123', 10), role: 'staff' })
    await AdminUser.create({ name: 'Ramesh Gupta', email: 'ramesh@fees.com', password: await bcrypt.hash('staff123', 10), role: 'staff' })
    // Students
    const students = await Student.insertMany([
      { name: 'Rahul Verma', roll_no: '1241019001', email: 'rahul@student.com', password: await bcrypt.hash('student123', 10), course: 'M.Sc. Computer Science', semester: 4 },
      { name: 'Anjali Singh', roll_no: '1241019002', email: 'anjali@student.com', password: await bcrypt.hash('student123', 10), course: 'M.Sc. Computer Science', semester: 4 },
      { name: 'Vikas Tiwari', roll_no: '1241019003', email: 'vikas@student.com', password: await bcrypt.hash('student123', 10), course: 'M.Sc. Computer Science', semester: 4 },
      { name: 'Pooja Dubey', roll_no: '1241019004', email: 'pooja@student.com', password: await bcrypt.hash('student123', 10), course: 'M.Sc. Computer Science', semester: 4 },
      { name: 'Shivani Sahu', roll_no: '1241019030', email: 'shivani@student.com', password: await bcrypt.hash('student123', 10), course: 'M.Sc. Computer Science', semester: 4 },
    ])
    // Fee structures
    const fees = await FeeStructure.insertMany([
      { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Tuition Fee', amount: 12000, due_date: new Date('2026-07-31'), academic_year: '2025-26' },
      { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Exam Fee', amount: 1500, due_date: new Date('2026-07-31'), academic_year: '2025-26' },
      { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Library Fee', amount: 500, due_date: new Date('2026-07-31'), academic_year: '2025-26' },
      { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Development Fee', amount: 2000, due_date: new Date('2026-07-31'), academic_year: '2025-26' },
      { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Sports Fee', amount: 300, due_date: new Date('2026-07-31'), academic_year: '2025-26' },
    ])
    // Sample payment for first student
    await PaymentTransaction.create({
      student_id: students[0]._id, fee_id: fees[0]._id,
      amount_paid: 12000, payment_method: 'online',
      receipt_no: 'REC-20260101-000001', status: 'paid',
      transaction_ref: 'TXN_SEED_001', processed_by: admin._id
    })
    res.json({ message: 'Database seeded successfully', students: students.length, fees: fees.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default app
