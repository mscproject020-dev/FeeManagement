import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const adminLinks = [
  { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/admin/students', icon: 'bi-people', label: 'Students' },
  { to: '/admin/fees', icon: 'bi-currency-rupee', label: 'Fee Structures' },
  { to: '/admin/reports', icon: 'bi-bar-chart', label: 'Reports' },
  { to: '/admin/reminders', icon: 'bi-bell', label: 'Reminders' }
]

const staffLinks = [
  { to: '/staff/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/staff/process-payment', icon: 'bi-cash-coin', label: 'Process Payment' },
  { to: '/staff/payments', icon: 'bi-list-check', label: 'View Payments' }
]

const studentLinks = [
  { to: '/student/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/student/fees', icon: 'bi-receipt', label: 'Fee Details' },
  { to: '/student/pay', icon: 'bi-credit-card', label: 'Make Payment' },
  { to: '/student/payments', icon: 'bi-clock-history', label: 'Payment History' },
  { to: '/student/profile', icon: 'bi-person', label: 'My Profile' }
]

export default function Sidebar() {
  const { user } = useAuth()
  const links = user?.role === 'administrator' ? adminLinks
    : user?.role === 'staff' ? staffLinks
    : studentLinks

  return (
    <div className="sidebar d-flex flex-column" style={{ width: '220px', minWidth: '220px' }}>
      <div className="sidebar-brand">
        <div className="text-white fw-bold fs-6">
          <i className="bi bi-mortarboard-fill me-2"></i>
          Fee Portal
        </div>
        <div className="text-white opacity-50" style={{ fontSize: '0.7rem' }}>
          Pandit S.N. Shukla University
        </div>
      </div>
      <nav className="nav flex-column flex-grow-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${link.icon} me-2`}></i>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 text-white opacity-25" style={{ fontSize: '0.65rem' }}>
        PSNSU © 2025
      </div>
    </div>
  )
}
