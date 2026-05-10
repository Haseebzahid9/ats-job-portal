import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase, FiUserPlus,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { register as registerService } from '../services/auth_service'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', cnic: '', password: '', confirmPassword: '', role: 'candidate' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error('Please fill in all required fields')
      return
    }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role }
      if (form.cnic) payload.cnic = form.cnic
      const res = await registerService(payload)
      const { token, user } = res.data
      login(user, token)
      toast.success('Account created! Welcome aboard')
      navigate(user.role === 'hr' || user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #060814 0%, #0a0d1e 55%, #0c0a1f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '5%', right: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)', pointerEvents: 'none', animation: 'glowPulse 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '8%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', pointerEvents: 'none', animation: 'glowPulse 6s ease-in-out infinite 1.5s' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 18px rgba(99,102,241,0.42)' }}>
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
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(139,92,246,0.1) 50%, transparent 100%)', padding: '1.375rem 1.875rem', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <h2 style={{ fontSize: '1.1875rem', fontWeight: 800, color: '#fff', marginBottom: '0.125rem' }}>Create your account ✨</h2>
              <p style={{ fontSize: '0.7875rem', color: 'rgba(255,255,255,0.4)' }}>It&apos;s completely free — no credit card needed</p>
            </div>

            <div style={{ padding: '1.375rem 1.875rem' }}>
              <form onSubmit={handleSubmit} noValidate>
                {/* Account type */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem' }}>
                    I am a
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {[
                      { value: 'candidate', label: '👤 Job Seeker' },
                      { value: 'hr', label: '🏢 HR / Recruiter' },
                    ].map(({ value, label }) => (
                      <button key={value} type="button" onClick={() => setForm(p => ({ ...p, role: value }))}
                        style={{
                          padding: '0.625rem',
                          background: form.role === value ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${form.role === value ? '#6366f1' : 'rgba(255,255,255,0.09)'}`,
                          borderRadius: 10, cursor: 'pointer',
                          color: form.role === value ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
                          fontFamily: 'inherit', fontSize: '0.8125rem', fontWeight: 600,
                          transition: 'all 0.2s',
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.875rem' }}>
                  <div style={{ marginBottom: '0.875rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem' }}>Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <FiUser size={13} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
                      <input type="text" name="name" className="form-input" placeholder="e.g. John Doe" value={form.name} onChange={handleChange} style={{ paddingLeft: '2.3rem', fontSize: '0.8375rem', padding: '0.675rem 0.9rem 0.675rem 2.3rem' }} autoComplete="name" required />
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.875rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem' }}>Email *</label>
                    <div style={{ position: 'relative' }}>
                      <FiMail size={13} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
                      <input type="email" name="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} style={{ paddingLeft: '2.3rem', fontSize: '0.8375rem', padding: '0.675rem 0.9rem 0.675rem 2.3rem' }} autoComplete="email" required />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '0.875rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem' }}>
                    CNIC <span style={{ color: 'rgba(255,255,255,0.28)', fontWeight: 400, fontSize: '0.74rem' }}>(optional)</span>
                  </label>
                  <input type="text" name="cnic" className="form-input" placeholder="00000-0000000-0" value={form.cnic} onChange={handleChange} style={{ fontSize: '0.8375rem', padding: '0.675rem 0.9rem' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.875rem' }}>
                  <div style={{ marginBottom: '0.875rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem' }}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <FiLock size={13} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
                      <input type={showPass ? 'text' : 'password'} name="password" className="form-input" placeholder="At least 6 chars" value={form.password} onChange={handleChange} style={{ paddingLeft: '2.3rem', paddingRight: '2.3rem', fontSize: '0.8375rem', padding: '0.675rem 2.3rem' }} autoComplete="new-password" required />
                      <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                        {showPass ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.875rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem' }}>Confirm Password *</label>
                    <div style={{ position: 'relative' }}>
                      <FiLock size={13} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
                      <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} style={{ paddingLeft: '2.3rem', paddingRight: '2.3rem', fontSize: '0.8375rem', padding: '0.675rem 2.3rem' }} autoComplete="new-password" required />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                        {showConfirm ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary"
                  style={{ width: '100%', padding: '0.78125rem', borderRadius: 50, fontSize: '0.875rem', justifyContent: 'center', marginTop: '0.375rem', gap: '0.5rem' }}
                  disabled={loading}>
                  <FiUserPlus size={15} />
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', margin: '0.875rem 0 0.75rem' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              <button type="button"
                onClick={() => toast('Google signup coming soon', { icon: '🔗' })}
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
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#a5b4fc', fontWeight: 600 }}>Sign in</Link>
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
  )
}
