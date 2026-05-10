import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'

// Lazy-loaded page components
const Home           = lazy(() => import('../pages/Home'))
const Jobs           = lazy(() => import('../pages/Jobs'))
const JobDetails     = lazy(() => import('../pages/JobDetails'))
const Login          = lazy(() => import('../pages/Login'))
const Register       = lazy(() => import('../pages/Register'))
const Dashboard      = lazy(() => import('../pages/Dashboard'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const Contact        = lazy(() => import('../pages/Contact'))
const SuccessStories = lazy(() => import('../pages/SuccessStories'))
const NotFound       = lazy(() => import('../pages/NotFound'))

/**
 * ProtectedRoute — redirects to /login when the user is not authenticated.
 * Saves the attempted URL so we can redirect back after login.
 */
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <Loader />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Optional role-based guard
  if (roles && roles.length > 0 && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/"                element={<Home />} />
        <Route path="/jobs"            element={<Jobs />} />
        <Route path="/jobs/:id"        element={<JobDetails />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/contact"         element={<Contact />} />
        <Route path="/success-stories" element={<SuccessStories />} />

        {/* Protected — any authenticated user */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected — admin / hr only */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
