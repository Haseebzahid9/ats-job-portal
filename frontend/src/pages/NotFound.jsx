import { Link } from 'react-router-dom'
import { FiAlertCircle, FiHome, FiBriefcase } from 'react-icons/fi'

export default function NotFound() {
  return (
    <main className="page-wrapper">
      <div
        style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div className="card-elevated animate-slideUp" style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(248,113,113,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <FiAlertCircle size={36} color="#f87171" />
          </div>

          <h1
            style={{
              fontSize: '5rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #4d7c3f, #6ea84d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              marginBottom: '0.5rem',
            }}
          >
            404
          </h1>

          <h2 style={{ fontSize: '1.375rem', marginBottom: '0.75rem' }}>Page Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
            The page you are looking for doesn't exist or has been moved.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn-primary">
              <FiHome size={15} /> Go Home
            </Link>
            <Link to="/jobs" className="btn-ghost">
              <FiBriefcase size={15} /> Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
