import jwt from 'jsonwebtoken'

export function verifyToken(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) throw new Error('No token')
  return jwt.verify(token, process.env.JWT_SECRET)
}

export function requireRole(req, ...roles) {
  const user = verifyToken(req)
  if (!roles.includes(user.role)) throw new Error('Forbidden')
  return user
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}
