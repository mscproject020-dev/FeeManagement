import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import AdminDashboard  from './pages/admin/Dashboard';
import AdminStudents   from './pages/admin/Students';
import AdminFees       from './pages/admin/Fees';
import AdminReports    from './pages/admin/Reports';
import AdminReminders  from './pages/admin/Reminders';
import StaffDashboard  from './pages/staff/Dashboard';
import ViewPayments    from './pages/staff/ViewPayments';
import ProcessPayment  from './pages/staff/ProcessPayment';
import StudentDashboard from './pages/student/Dashboard';
import FeeDetails      from './pages/student/FeeDetails';
import PaymentHistory  from './pages/student/PaymentHistory';
import MakePayment     from './pages/student/MakePayment';
import Receipt         from './pages/student/Receipt';
import Profile         from './pages/student/Profile';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-area">{children}</main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--void)' }}>
      <div className="spinner-ring" style={{ width: 44, height: 44 }} />
    </div>
  );

  const redirect = user
    ? user.role === 'administrator' ? '/admin/dashboard'
    : user.role === 'staff'         ? '/staff/dashboard'
    : '/student/dashboard'
    : '/';

  const protect = (roles, el) => (
    <ProtectedRoute allowedRoles={roles}>
      <AppLayout>{el}</AppLayout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={redirect} /> : <Login />} />

      <Route path="/admin/dashboard" element={protect(['administrator'], <AdminDashboard />)} />
      <Route path="/admin/students"  element={protect(['administrator','staff'], <AdminStudents />)} />
      <Route path="/admin/fees"      element={protect(['administrator'], <AdminFees />)} />
      <Route path="/admin/reports"   element={protect(['administrator'], <AdminReports />)} />
      <Route path="/admin/reminders" element={protect(['administrator'], <AdminReminders />)} />

      <Route path="/staff/dashboard"       element={protect(['staff','administrator'], <StaffDashboard />)} />
      <Route path="/staff/payments"        element={protect(['staff','administrator'], <ViewPayments />)} />
      <Route path="/staff/process-payment" element={protect(['staff','administrator'], <ProcessPayment />)} />

      <Route path="/student/dashboard"       element={protect(['student'], <StudentDashboard />)} />
      <Route path="/student/fees"            element={protect(['student'], <FeeDetails />)} />
      <Route path="/student/payment-history" element={protect(['student'], <PaymentHistory />)} />
      <Route path="/student/make-payment"    element={protect(['student'], <MakePayment />)} />
      <Route path="/student/receipt/:receipt_no" element={protect(['student'], <Receipt />)} />
      <Route path="/student/profile"         element={protect(['student'], <Profile />)} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
