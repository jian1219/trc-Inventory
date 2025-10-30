import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user')

  if (!user) {
    // not logged in → redirect to login page
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
