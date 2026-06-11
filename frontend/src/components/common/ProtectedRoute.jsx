import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles, roles }) {
  const { user, loading } = useAuth()
  const permittedRoles = allowedRoles || roles

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (permittedRoles && !permittedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}