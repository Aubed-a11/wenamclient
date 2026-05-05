import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store'

export function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.role !== 'admin') return <Navigate to="/admin/login" replace />
  return children
}

export function PublicOnlyRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return children
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/" replace />
}

export function AdminPublicRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return children
}


