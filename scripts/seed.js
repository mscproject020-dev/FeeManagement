import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

await mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection
const hash = p => bcrypt.hash(p, 12)

// Clear existing
await db.collection('students').deleteMany({})
await db.collection('adminusers').deleteMany({})
await db.collection('feestructures').deleteMany({})
await db.collection('paymenttransactions').deleteMany({})
await db.collection('feereminders').deleteMany({})

// Admin users
await db.collection('adminusers').insertMany([
  { name: 'Admin User',   email: 'admin@fees.com',  password: await hash('admin123'),  role: 'administrator', status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { name: 'Priya Sharma', email: 'priya@fees.com',  password: await hash('staff123'),  role: 'staff',         status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { name: 'Ramesh Gupta', email: 'ramesh@fees.com', password: await hash('staff123'),  role: 'staff',         status: 'active', createdAt: new Date(), updatedAt: new Date() },
])

// Students
await db.collection('students').insertMany([
  { name: 'Rahul Sharma',  roll_no: 'MSC2024001', email: 'rahul@student.com',   password: await hash('student123'), course: 'M.Sc. Computer Science', semester: 4, phone: '9876543210', address: 'Shahdol, M.P.', status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { name: 'Anjali Gupta',  roll_no: 'MSC2024002', email: 'anjali@student.com',  password: await hash('student123'), course: 'M.Sc. Computer Science', semester: 4, phone: '9876543211', address: 'Jabalpur, M.P.', status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { name: 'Vikas Tiwari',  roll_no: 'MSC2024003', email: 'vikas@student.com',   password: await hash('student123'), course: 'M.Sc. Computer Science', semester: 4, phone: '9876543212', address: 'Bhopal, M.P.', status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { name: 'Pooja Mishra',  roll_no: 'MSC2024004', email: 'pooja@student.com',   password: await hash('student123'), course: 'M.Sc. Computer Science', semester: 4, phone: '9876543213', address: 'Rewa, M.P.', status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { name: 'Shivani Sahu',  roll_no: 'MSC2024005', email: 'shivani@student.com', password: await hash('student123'), course: 'M.Sc. Computer Science', semester: 4, phone: '9876543214', address: 'Shahdol, M.P.', status: 'active', createdAt: new Date(), updatedAt: new Date() },
])

// Fee structure
const tomorrow = new Date(); tomorrow.setMonth(tomorrow.getMonth() + 1)
await db.collection('feestructures').insertMany([
  { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Tuition Fee',        amount: 15000, due_date: tomorrow, academic_year: '2025-26', status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Examination Fee',    amount: 2500,  due_date: tomorrow, academic_year: '2025-26', status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Library Fee',        amount: 500,   due_date: tomorrow, academic_year: '2025-26', status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Development Fee',    amount: 1000,  due_date: tomorrow, academic_year: '2025-26', status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { course: 'M.Sc. Computer Science', semester: 4, fee_category: 'Sports & Activity',  amount: 300,   due_date: tomorrow, academic_year: '2025-26', status: 'active', createdAt: new Date(), updatedAt: new Date() },
])

console.log('✓ Database seeded successfully')
console.log('\nDemo Credentials:')
console.log('  Admin   → admin@fees.com   / admin123')
console.log('  Staff   → priya@fees.com   / staff123')
console.log('  Student → rahul@student.com / student123')
await mongoose.disconnect()
