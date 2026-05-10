import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase,
  FiArrowRight, FiCheckCircle,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { login as loginService } from '../services/auth_service'
import { useAuth } from '../hooks/useAuth'

function LoginOverlay({ stage, user }) {
  if (!stage) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(6,8,20,0.96)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        textAlign: 'center', maxWidth: 320, padding: '2.25rem 1.75rem',
        background: 'rgba(15,18,38,0.99)',
        border: '1px solid rgba(99,102,241,0.28)',
        borderRadius: 18,
        boxShadow: '0 20px 60px rgba(99,102,241,0.18)',
        animation: 'scaleIn 0.25s ease',
      }}>
        {stage === 'loading' && (
          <>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              border: '3px solid rgba(99,102,241,0.18)',
              borderTop: '3px solid #6366f1',
              margin: '0 auto 1.1rem',
              animation: 'spin 0.85s linear infinite',
            }} />
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.3rem' }}>Signing in…</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem' }}>Please wait a moment</p>
            <div style={{ marginTop: '1rem', height: 2.5, borderRadius: 2, background: 'rgba(99,102,241,0.12)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#6366f1,#818cf8)', animation: 'loadBar 1.4s ease-in-out infinite', width: '55%' }} />
            </div>
          </>
        )}
        {stage === 'success' && user && (
          <>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.1rem',
              boxShadow: '0 0 22px rgba(99,102,241,0.45)',
            }}>
              <FiCheckCircle size={24} color="#fff" />
            </div>
            <p style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Welcome back!</p>
            <p style={{ color: '#a5b4fc', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{user.name}</p>
            <span style={{
              display: 'inline-block', padding: '0.18rem 0.7rem',
              background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.28)',
              borderRadius: 50, fontSize: '0.75rem', color: '#c7d2fe', textTransform: 'capitalize',
            }}>{user.role}</span>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.875rem' }}>Redirecting to dashboard…</p>
          </>
        )}
      </div>
      <style>{`
        @keyframes loadBar {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [overlayStage, setOverlayStage] = useState(null)
  const [successUser, setSuccessUser] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Email and password are required'); return }
    setOverlayStage('loading')
    try {
      const res = await loginService(form)
      const { token, user } = res.data
      login(user, token)
      setSuccessUser(user)
      setOverlayStage('success')
      setTimeout(() => navigate(from, { replace: true }), 1600)
    } catch (err) {
      setOverlayStage(null)
      toast.error(err.response?.data?.message || 'Login failed — check your email or password')
    }
  }

  return (
    <>
      <LoginOverlay stage={overlayStage} user={successUser} />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #060814 0%, #0a0d1e 55%, #0c0a1f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '5%', left: '8%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)', pointerEvents: 'none', animation: 'glowPulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', pointerEvents: 'none', animation: 'glowPulse 6s ease-in-out infinite 1.5s' }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', marginBottom: '1.6rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 5px 18px rgba(99,102,241,0.42)',
            }}>
              <FiBriefcase size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>Jobs Portal</p>
              <p style={{ fontSize: '0.675rem', color: 'rgba(255,255,255,0.32)' }}>Find your next opportunity</p>
            </div>
          </div>

          {/* Animated gradient border wrapper */}
          <div style={{
            padding: '1.5px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.7), rgba(139,92,246,0.35), rgba(99,102,241,0.1), rgba(139,92,246,0.65))',
            backgroundSize: '300% 300%',
            animation: 'gradBorder 4.5s ease infinite',
            boxShadow: '0 0 40px rgba(99,102,241,0.12)',
          }}>
            <div style={{ background: 'rgba(10,13,30,0.98)', borderRadius: 19, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(139,92,246,0.1) 50%, transparent 100%)',
                padding: '1.375rem 1.875rem',
                borderBottom: '1px solid rgba(99,102,241,0.1)',
              }}>
                <h2 style={{ fontSize: '1.1875rem', fontWeight: 800, color: '#fff', marginBottom: '0.125rem' }}>
                  Welcome back 👋
                </h2>
                <p style={{ fontSize: '0.7875rem', color: 'rgba(255,255,255,0.4)' }}>
                  Sign in to continue to your account
                </p>
              </div>

              <div style={{ padding: '1.375rem 1.875rem' }}>
                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', letterSpacing: '0.01em' }}>
                      Email address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FiMail size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
                      <input
                        type="email" name="email" className="form-input"
                        placeholder="you@example.com"
                        value={form.email} onChange={handleChange}
                        style={{ paddingLeft: '2.4rem', fontSize: '0.875rem', padding: '0.7rem 1rem 0.7rem 2.4rem' }}
                        autoComplete="email" required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.7875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.01em' }}>
                        Password
                      </label>
                      <span style={{ fontSize: '0.74rem', color: '#a5b4fc', cursor: 'pointer' }}
                        onClick={() => toast('Password reset coming soon', { icon: '🔒' })}>
                        Forgot password?
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <FiLock size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
                      <input
                        type={showPassword ? 'text' : 'password'} name="password" className="form-input"
                        placeholder="••••••••"
                        value={form.password} onChange={handleChange}
                        style={{ fontSize: '0.875rem', padding: '0.7rem 2.6rem 0.7rem 2.4rem' }}
                        autoComplete="current-password" required
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                        {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" className="btn-primary"
                    style={{ width: '100%', padding: '0.78125rem', borderRadius: 50, fontSize: '0.875rem', justifyContent: 'center', marginTop: '0.625rem', gap: '0.5rem' }}
                    disabled={!!overlayStage}
                  >
                    <FiArrowRight size={15} />
                    Sign In
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', margin: '0.875rem 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                </div>

                <button type="button"
                  onClick={() => toast('Google login coming soon', { icon: '🔗' })}
                  style={{
                    width: '100%', padding: '0.7rem',
                    background: 'rgba(255,255,255,0.035)',
                    border: '1.5px solid rgba(255,255,255,0.09)',
                    borderRadius: 50, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    color: 'rgba(255,255,255,0.8)', fontSize: '0.8375rem', fontWeight: 600,
                    transition: 'background 0.2s, border-color 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.5 0 6.3 1.2 8.6 3.1l6.4-6.4C34.9 2.7 29.8.5 24 .5 14.8.5 7 6.3 3.5 14.4l7.5 5.8C12.7 14 17.9 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.9 7.2l7.5 5.8c4.4-4.1 7.2-10.2 7.2-17z"/>
                    <path fill="#FBBC05" d="M10.9 28.2c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.5-5.8C1.3 16.5.5 20.1.5 24s.8 7.5 2.9 10.9l7.5-5.7z"/>
                    <path fill="#34A853" d="M24 47.5c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.1 0-11.3-4.1-13.1-9.7l-7.5 5.8C7 41.7 14.8 47.5 24 47.5z"/>
                  </svg>
                  Continue with Google
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.1rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)' }}>
                    Don&apos;t have an account?{' '}
                    <Link to="/register" style={{ color: '#a5b4fc', fontWeight: 600 }}>Create one</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes gradBorder {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    </>
  )
}
