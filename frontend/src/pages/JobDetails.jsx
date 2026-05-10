import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FiMapPin, FiClock, FiArrowLeft, FiBriefcase, FiUsers,
  FiUpload, FiX, FiCheckCircle, FiAlertCircle, FiDollarSign
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getJobById } from '../services/job_service'
import { applyForJob, checkIfApplied } from '../services/application_service'
import { formatSalary, formatDate } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'

export default function JobDetails() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isCandidate = user?.role === 'candidate' || user?.role === 'applicant'

  const [applyOpen, setApplyOpen] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [coverLetterFile, setCoverLetterFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Helper to fully reset modal state
  const resetModal = () => {
    setApplyOpen(false)
    setResumeFile(null)
    setCoverLetterFile(null)
    setIsSubmitting(false)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id).then(r => r.data?.job || r.data),
    enabled: Boolean(id),
  })

  // Pre-check: has this user already applied for this job?
  const { data: appliedData } = useQuery({
    queryKey: ['check-applied', id, user?._id],
    queryFn: () => checkIfApplied(id).then(r => r.data),
    enabled: Boolean(id && isAuthenticated && isCandidate),
    staleTime: 60000,
    retry: false,
  })
  const hasAlreadyApplied = appliedData?.applied === true

  const applyMutation = useMutation({
    mutationFn: (formData) => applyForJob(formData),
    onSuccess: () => {
      toast.dismiss()
      toast.success('Application submitted successfully! 🎉')
      resetModal()
      queryClient.invalidateQueries(['my-applications'])
      queryClient.invalidateQueries(['check-applied', id])
    },
    onError: (err) => {
      setIsSubmitting(false)
      toast.dismiss() // clear any stacked toasts
      const msg = err.response?.data?.message || 'Failed to submit application.'
      toast.error(msg)
    },
  })

  const handleApply = (e) => {
    e.preventDefault()
    if (isSubmitting || applyMutation.isPending) return  // hard guard
    if (!resumeFile) { toast.error('Please upload your resume.'); return }
    setIsSubmitting(true)
    const fd = new FormData()
    fd.append('job', id)
    fd.append('resume', resumeFile)
    if (coverLetterFile) fd.append('coverLetter', coverLetterFile)
    applyMutation.mutate(fd)
  }

  if (isLoading) return <Loader />
  if (isError || !data) {
    return (
      <main className="page-wrapper">
        <div className="container section" style={{ textAlign: 'center' }}>
          <FiAlertCircle size={48} style={{ color: '#f87171', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Job not found or failed to load.</p>
          <Link to="/jobs" className="btn-secondary">Back to Jobs</Link>
        </div>
      </main>
    )
  }

  const job = data

  return (
    <main className="page-wrapper">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #060d1a 0%, #0a1628 60%, #081a10 100%)',
        padding: '3rem 0 2.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <button
            className="btn-ghost"
            onClick={() => navigate(-1)}
            style={{ marginBottom: '1.5rem', padding: '0.4rem 0.9rem', borderRadius: 50 }}
          >
            <FiArrowLeft size={15} /> Back
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #4d7c3f, #6ea84d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 4px 20px rgba(77,124,63,0.3)',
            }}>
              <FiBriefcase size={28} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.4rem' }}>
                {job.title}
              </h1>
              <p style={{ color: 'var(--accent-light)', fontWeight: 600, fontSize: '1.0625rem' }}>
                {job.department}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                {job.branch && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                    <FiMapPin size={14} color="var(--accent-green)" /> {job.branch}
                  </span>
                )}
                {job.jobType && (
                  <span style={{
                    padding: '0.25rem 0.85rem', borderRadius: 50,
                    background: 'rgba(77,124,63,0.15)', color: '#86efac',
                    fontSize: '0.8125rem', fontWeight: 600, border: '1px solid rgba(77,124,63,0.3)',
                  }}>
                    {job.jobType}
                  </span>
                )}
                {job.seats && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                    <FiUsers size={14} color="var(--accent-green)" /> {job.seats} Seat{job.seats !== 1 ? 's' : ''}
                  </span>
                )}
                {job.deadline && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                    <FiClock size={14} color="var(--accent-green)" /> Deadline: {formatDate(job.deadline)}
                  </span>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                    <FiDollarSign size={14} color="var(--accent-green)" /> {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container section" style={{ maxWidth: 900 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          {/* Main content */}
          <div className="card-elevated animate-slideInLeft">
            {job.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-light)' }}>
                  Job Description
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                  {job.description}
                </p>
              </div>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-light)' }}>
                  Requirements
                </h2>
                {Array.isArray(job.requirements) ? (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {job.requirements.map((r, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        <FiCheckCircle size={16} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.requirements}</p>
                )}
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-light)' }}>
                  Skills Required
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {job.skills.map((s, i) => (
                    <span key={i} style={{
                      padding: '0.35rem 0.85rem', borderRadius: 50,
                      background: 'rgba(77,124,63,0.1)', border: '1px solid rgba(77,124,63,0.25)',
                      color: '#86efac', fontSize: '0.8125rem', fontWeight: 500,
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card animate-slideInRight">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Job Details</h3>
              {[
                { label: 'Department', value: job.department },
                { label: 'Location', value: job.branch },
                { label: 'Type', value: job.jobType },
                { label: 'Experience', value: job.experience },
                { label: 'Seats', value: job.seats },
                { label: 'Salary', value: (job.salaryMin || job.salaryMax) ? formatSalary(job.salaryMin, job.salaryMax) : null },
                { label: 'Deadline', value: job.deadline ? formatDate(job.deadline) : null },
                { label: 'Posted', value: formatDate(job.createdAt) },
              ].filter(item => item.value).map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="card animate-slideInRight delay-100">
              {isAuthenticated ? (
                isCandidate ? (
                  hasAlreadyApplied ? (
                    <div style={{
                      width: '100%', padding: '0.875rem',
                      borderRadius: 50, fontSize: '0.9375rem',
                      background: 'rgba(16,185,129,0.12)',
                      border: '1.5px solid rgba(16,185,129,0.35)',
                      color: '#6ee7b7', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}>
                      <FiCheckCircle size={17} /> Already Applied
                    </div>
                  ) : (
                    <button
                      onClick={() => setApplyOpen(true)}
                      className="btn-primary"
                      style={{ width: '100%', padding: '0.875rem', borderRadius: 50, fontSize: '1rem' }}
                    >
                      Apply for this Job
                    </button>
                  )
                ) : (
                  <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Only candidates can apply.
                  </p>
                )
              ) : (
                <>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
                    Sign in to apply for this position
                  </p>
                  <Link
                    to="/login"
                    state={{ from: { pathname: `/jobs/${id}` } }}
                    className="btn-primary"
                    style={{ width: '100%', padding: '0.875rem', borderRadius: 50, fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
                  >
                    Sign In to Apply
                  </Link>
                  <Link to="/register" className="btn-ghost" style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', borderRadius: 50, display: 'flex', justifyContent: 'center' }}>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1rem', backdropFilter: 'blur(4px)',
        }}>
          <div className="card-elevated animate-slideUp" style={{ width: '100%', maxWidth: 500, position: 'relative' }}>
            <button
              onClick={resetModal}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <FiX size={20} />
            </button>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.4rem' }}>Apply for Job</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>{job.title}</p>

            <form onSubmit={handleApply}>
              {/* Resume */}
              <div className="form-group">
                <label className="form-label">Resume (PDF/DOC) *</label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem 1rem', background: 'rgba(13,22,41,0.8)',
                  border: `1.5px dashed ${resumeFile ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.2s',
                }}>
                  <FiUpload size={18} color={resumeFile ? 'var(--accent-green)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.9rem', color: resumeFile ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                    {resumeFile ? resumeFile.name : 'Click to upload resume'}
                  </span>
                  <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                    onChange={e => setResumeFile(e.target.files[0])} />
                </label>
              </div>

              {/* Cover Letter */}
              <div className="form-group">
                <label className="form-label">Cover Letter (Optional)</label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem 1rem', background: 'rgba(13,22,41,0.8)',
                  border: `1.5px dashed ${coverLetterFile ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.2s',
                }}>
                  <FiUpload size={18} color={coverLetterFile ? 'var(--accent-green)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.9rem', color: coverLetterFile ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                    {coverLetterFile ? coverLetterFile.name : 'Click to upload cover letter'}
                  </span>
                  <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                    onChange={e => setCoverLetterFile(e.target.files[0])} />
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', borderRadius: 50, fontSize: '1rem' }}
                disabled={applyMutation.isPending || isSubmitting}
              >
                {applyMutation.isPending || isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
