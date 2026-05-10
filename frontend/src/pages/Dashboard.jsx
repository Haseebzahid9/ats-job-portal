import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  FiBriefcase, FiUser, FiFileText, FiCalendar, FiUpload,
  FiSave, FiLock, FiCamera, FiSettings, FiArrowRight,
  FiCheckCircle, FiClock, FiAlertCircle, FiDownload,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getMyApplications } from '../services/application_service'
import { updateProfile, uploadProfilePicture, changePassword } from '../services/auth_service'
import api from '../services/api'
import { getInitials, formatDate, getStatusColor } from '../utils/helpers'
import Loader from '../components/common/Loader'

const TABS = [
  { key: 'overview',      label: 'Overview',        icon: FiSettings },
  { key: 'applications',  label: 'My Applications', icon: FiFileText },
  { key: 'profile',       label: 'Edit Profile',    icon: FiUser },
  { key: 'security',      label: 'Password',        icon: FiLock },
]

const STATUS_ICONS = {
  'Submitted':           { icon: FiClock,        color: '#60a5fa' },
  'Under Review':        { icon: FiAlertCircle,  color: '#fbbf24' },
  'Shortlisted':         { icon: FiCheckCircle,  color: '#6ee7b7' },
  'Interview Scheduled': { icon: FiCalendar,     color: '#c4b5fd' },
  'Rejected':            { icon: FiAlertCircle,  color: '#fca5a5' },
  'Selected':            { icon: FiCheckCircle,  color: '#34d399' },
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const isHR = user?.role === 'hr' || user?.role === 'admin'
  const [tab, setTab] = useState('overview')

  const [profile, setProfile] = useState({
    name: user?.name || '', phone: user?.phone || '',
    cnic: user?.cnic || '', department: user?.department || '', branch: user?.branch || '',
  })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ cur: false, new: false, conf: false })
  const resumeInputRef = useRef(null)

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => getMyApplications().then(r => r.data?.applications || r.data || []),
    enabled: !isHR,
  })

  const profileMutation = useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: () => { toast.success('Profile updated!'); refreshUser() },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed.'),
  })

  const picMutation = useMutation({
    mutationFn: (fd) => uploadProfilePicture(fd),
    onSuccess: () => { toast.success('Profile picture updated!'); refreshUser() },
    onError: () => toast.error('Failed to upload picture.'),
  })

  const resumeMutation = useMutation({
    mutationFn: (fd) => api.put('/auth/profile/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { toast.success('Resume uploaded!'); refreshUser() },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to upload resume. Try a PDF/DOC file.'),
  })

  const pwMutation = useMutation({
    mutationFn: (data) => changePassword(data),
    onSuccess: () => {
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Password change failed.'),
  })

  const handlePicUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('profilePicture', file)
    picMutation.mutate(fd)
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('resume', file)
    resumeMutation.mutate(fd)
  }

  const handleProfileSave = (e) => {
    e.preventDefault()
    profileMutation.mutate(profile)
  }

  const handlePwSave = (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    pwMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
  }

  const applications = appsData || []

  const stats = !isHR ? [
    { label: 'Applied', value: applications.length, color: '#a78bfa', bg: 'rgba(124,58,237,0.12)' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length, color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'Interview Scheduled').length, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Pending', value: applications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
  ] : []

  return (
    <main className="page-wrapper">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #07091a 0%, #0a0f1e 60%, #0d0a22 100%)',
        padding: '2.5rem 0 0',
        borderBottom: '1px solid rgba(124,58,237,0.12)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-30%', right: '-5%', width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Profile row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.625rem', fontWeight: 800, color: '#fff', overflow: 'hidden',
                boxShadow: '0 6px 24px rgba(124,58,237,0.4)',
                border: '3px solid rgba(124,58,237,0.4)',
              }}>
                {user?.profilePicture
                  ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : getInitials(user?.name || 'U')}
              </div>
              <label style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: picMutation.isLoading ? 'wait' : 'pointer',
                border: '2px solid #0a0f1e',
                boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                {picMutation.isLoading ? (
                  <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <FiCamera size={13} color="#fff" />
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicUpload} />
              </label>
            </div>

            {/* User info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 900 }}>{user?.name || 'User'}</h1>
                <span style={{
                  background: 'rgba(124,58,237,0.18)', color: '#c4b5fd',
                  padding: '0.2rem 0.8rem', borderRadius: 50, fontSize: '0.8125rem',
                  fontWeight: 700, border: '1px solid rgba(124,58,237,0.3)',
                  textTransform: 'capitalize',
                }}>
                  {user?.role || 'candidate'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>{user?.email}</p>
              {user?.phone && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>{user.phone}</p>
              )}
            </div>

            {isHR ? (
              <Link to="/admin" className="btn-primary" style={{ borderRadius: 50 }}>
                <FiSettings size={16} /> Admin Panel <FiArrowRight size={14} />
              </Link>
            ) : (
              /* CV/Resume upload button */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <button
                  className="btn-secondary"
                  style={{ borderRadius: 50, fontSize: '0.9rem' }}
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeMutation.isLoading}
                >
                  <FiUpload size={15} />
                  {resumeMutation.isLoading ? 'Uploading…' : user?.resume ? 'Update CV/Resume' : 'Upload CV/Resume'}
                </button>
                {user?.resume && (
                  <a href={user.resume} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '0.8125rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiDownload size={13} /> View current resume
                  </a>
                )}
                <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
              </div>
            )}
          </div>

          {/* Stats row (candidates only) */}
          {!isHR && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {stats.map(({ label, value, color, bg }) => (
                <div key={label} style={{
                  padding: '0.6rem 1.25rem',
                  background: bg,
                  border: `1px solid ${color}30`,
                  borderRadius: 50,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.0625rem', fontWeight: 800, color }}>{value}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
            {TABS.filter(t => isHR ? t.key !== 'applications' : true).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: '1rem 1.375rem', background: 'none', border: 'none',
                  borderBottom: `2.5px solid ${tab === key ? 'var(--accent)' : 'transparent'}`,
                  color: tab === key ? '#fff' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontSize: '0.9375rem', fontWeight: tab === key ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'color 0.2s, border-color 0.2s', whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  background: tab === key ? 'rgba(124,58,237,0.06)' : 'none',
                  borderRadius: '8px 8px 0 0',
                }}
                onMouseEnter={e => { if (tab !== key) e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { if (tab !== key) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.75rem', paddingBottom: '5rem' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="animate-fadeIn">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.75rem' }}>
              {[
                { icon: FiBriefcase, bg: 'linear-gradient(135deg, #7c3aed, #4f46e5)', label: 'Browse Jobs', sub: 'Find your next opportunity', to: '/jobs' },
                { icon: FiFileText, bg: 'linear-gradient(135deg, #4f46e5, #3730a3)', label: isHR ? 'All Applications' : 'My Applications', sub: isHR ? 'Review applicants' : 'Track submissions', action: () => setTab('applications') },
                { icon: FiUser, bg: 'linear-gradient(135deg, #6d28d9, #7c3aed)', label: 'Edit Profile', sub: 'Update your information', action: () => setTab('profile') },
                { icon: FiLock, bg: 'linear-gradient(135deg, #3730a3, #4f46e5)', label: 'Security', sub: 'Change your password', action: () => setTab('security') },
              ].map(({ icon: Icon, bg, label, sub, to, action }) => {
                const content = (
                  <div
                    className="card"
                    style={{
                      cursor: 'pointer',
                      background: 'rgba(17,24,39,0.82)',
                      transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                    }}
                    onClick={action}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 12px 36px rgba(124,58,237,0.15)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = ''
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    <div style={{
                      width: 50, height: 50, borderRadius: 14,
                      background: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1rem',
                      boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                    }}>
                      <Icon size={22} color="#fff" />
                    </div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.3rem' }}>{label}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{sub}</p>
                  </div>
                )
                return to
                  ? <Link key={label} to={to} style={{ textDecoration: 'none' }}>{content}</Link>
                  : <div key={label}>{content}</div>
              })}
            </div>

            {/* Recent applications preview */}
            {!isHR && applications.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.375rem' }}>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Recent Applications</h2>
                  <button onClick={() => setTab('applications')} className="btn-ghost" style={{ fontSize: '0.875rem' }}>
                    View all <FiArrowRight size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {applications.slice(0, 4).map((app, i) => {
                    const si = STATUS_ICONS[app.status] || STATUS_ICONS['Submitted']
                    const StatusIcon = si.icon
                    return (
                      <div key={app._id} className="card animate-slideUp" style={{ animationDelay: `${i * 0.07}s`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '1.25rem' }}>
                        <div style={{
                          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                        }}>
                          <FiBriefcase size={19} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{app.job?.title || 'Job'}</p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {app.job?.department} · Applied {formatDate(app.createdAt)}
                          </p>
                        </div>
                        <span className={getStatusColor(app.status)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <StatusIcon size={12} />
                          {app.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {!isHR && applications.length === 0 && !appsLoading && (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <FiBriefcase size={52} style={{ margin: '0 auto 1.25rem', opacity: 0.2 }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No Applications Yet</h3>
                <p style={{ marginBottom: '2rem', fontSize: '0.9375rem' }}>Start exploring jobs and apply today!</p>
                <Link to="/jobs" className="btn-primary" style={{ borderRadius: 50 }}>Browse Jobs <FiArrowRight size={15} /></Link>
              </div>
            )}
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {tab === 'applications' && !isHR && (
          <div className="animate-fadeIn">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.75rem' }}>My Applications</h2>
            {appsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader fullPage={false} size={46} /></div>
            ) : applications.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4.5rem', color: 'var(--text-muted)' }}>
                <FiFileText size={56} style={{ margin: '0 auto 1.25rem', opacity: 0.2 }} />
                <p style={{ marginBottom: '1.75rem', fontSize: '1.0625rem' }}>No applications yet. Start exploring jobs!</p>
                <Link to="/jobs" className="btn-primary" style={{ borderRadius: 50 }}>Browse Jobs</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.map((app, i) => {
                  const si = STATUS_ICONS[app.status] || STATUS_ICONS['Submitted']
                  const StatusIcon = si.icon
                  return (
                    <div key={app._id} className="card animate-slideUp" style={{ animationDelay: `${i * 0.05}s`, padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <div style={{
                          width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                        }}>
                          <FiBriefcase size={21} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 800, fontSize: '1.0625rem', marginBottom: '0.3rem' }}>{app.job?.title || 'Job'}</p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                            {app.job?.department} · {app.job?.branch} · Applied {formatDate(app.createdAt)}
                          </p>
                          {app.hrNotes && (
                            <p style={{ fontSize: '0.875rem', color: '#fbbf24', fontStyle: 'italic', marginTop: '0.4rem' }}>
                              HR Note: {app.hrNotes}
                            </p>
                          )}
                        </div>
                        <span className={getStatusColor(app.status)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 1rem' }}>
                          <StatusIcon size={13} />
                          {app.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div className="animate-fadeIn">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Edit Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
              {/* Profile picture card */}
              <div className="card-elevated" style={{ textAlign: 'center', border: '1px solid rgba(124,58,237,0.15)' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 110, height: 110, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', fontWeight: 800, color: '#fff', overflow: 'hidden',
                    boxShadow: '0 8px 28px rgba(124,58,237,0.4)',
                    border: '3px solid rgba(124,58,237,0.3)',
                    margin: '0 auto',
                  }}>
                    {user?.profilePicture
                      ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : getInitials(user?.name || 'U')}
                  </div>
                </div>
                <h3 style={{ fontWeight: 800, marginBottom: '0.25rem', fontSize: '1.125rem' }}>{user?.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{user?.email}</p>

                <label className="btn-secondary" style={{ borderRadius: 50, cursor: 'pointer', justifyContent: 'center', fontSize: '0.875rem', display: 'inline-flex', gap: '0.5rem', alignItems: 'center', padding: '0.6rem 1.25rem' }}>
                  <FiCamera size={15} />
                  {picMutation.isLoading ? 'Uploading…' : 'Change Photo'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicUpload} />
                </label>

                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Your Resume / CV</p>
                  <button
                    className="btn-secondary"
                    style={{ borderRadius: 50, fontSize: '0.875rem', width: '100%', justifyContent: 'center' }}
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={resumeMutation.isLoading}
                  >
                    <FiUpload size={15} />
                    {resumeMutation.isLoading ? 'Uploading…' : user?.resume ? 'Replace Resume' : 'Upload Resume'}
                  </button>
                  {user?.resume && (
                    <a href={user.resume} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.8125rem', color: '#a78bfa' }}>
                      <FiDownload size={13} /> View Resume
                    </a>
                  )}
                  <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
                </div>
              </div>

              {/* Profile form */}
              <form onSubmit={handleProfileSave} className="card-elevated" style={{ border: '1px solid rgba(124,58,237,0.15)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem' }}>Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Haseeb Zahid' },
                    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '03xxxxxxxxx' },
                    { key: 'cnic', label: 'CNIC (optional)', type: 'text', placeholder: '00000-0000000-0' },
                    { key: 'department', label: 'Department / Field', type: 'text', placeholder: 'Software Engineering' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key} className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{label}</label>
                      <input
                        type={type} className="form-input"
                        placeholder={placeholder}
                        value={profile[key]}
                        onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Preferred Location</label>
                  <select className="form-select" value={profile.branch} onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))}>
                    <option value="">Select location</option>
                    {['Islamabad', 'Lahore', 'Karachi', 'Remote'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <button
                  type="submit" className="btn-primary"
                  style={{ marginTop: '1.5rem', padding: '0.875rem 2.25rem', borderRadius: 50 }}
                  disabled={profileMutation.isLoading}
                >
                  <FiSave size={17} />
                  {profileMutation.isLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── SECURITY ── */}
        {tab === 'security' && (
          <div className="animate-fadeIn" style={{ maxWidth: 520 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Change Password</h2>
            <form onSubmit={handlePwSave} className="card-elevated" style={{ border: '1px solid rgba(124,58,237,0.15)' }}>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.7 }}>
                Choose a strong password with at least 6 characters.
              </p>
              {[
                { key: 'currentPassword', label: 'Current Password', show: 'cur' },
                { key: 'newPassword', label: 'New Password', show: 'new' },
                { key: 'confirmPassword', label: 'Confirm New Password', show: 'conf' },
              ].map(({ key, label, show }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw[show] ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={pwForm[key]}
                      onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      style={{ paddingRight: '3rem' }}
                      required
                    />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, [show]: !p[show] }))}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                      onMouseLeave={e => e.currentTarget.style.color = ''}
                    >
                      {showPw[show] ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="submit" className="btn-primary"
                style={{ marginTop: '0.75rem', padding: '0.875rem 2.25rem', borderRadius: 50 }}
                disabled={pwMutation.isLoading}
              >
                <FiLock size={17} />
                {pwMutation.isLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
