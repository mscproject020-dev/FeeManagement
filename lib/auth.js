import jwt from 'jsonwebtoken'

export function verifyToken(req) {
  const header = req.headers['authorization'] || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, process.env.JWT_SECRET)
}

export function requireRole(req, ...roles) {
  const payload = verifyToken(req)
  if (!roles.includes(payload.role)) throw new Error('Forbidden')
  return payload
}

export function json(res, status, data) {
  res.status(status).json(data)
}
