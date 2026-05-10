import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  FiBriefcase, FiUsers, FiPlusCircle, FiEdit2, FiTrash2,
  FiEye, FiCalendar, FiCheckCircle, FiX,
  FiSave, FiFileText, FiClock, FiMapPin, FiAlertCircle,
  FiTrendingUp, FiActivity, FiZap, FiAward
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getAllJobs, createJob, updateJob, deleteJob } from '../services/job_service'
import { getAllApplications, updateApplicationStatus } from '../services/application_service'
import { scheduleInterview, getAllInterviews } from '../services/interview_service'
import { formatDate, getStatusColor, truncateText } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'

const ADMIN_TABS = [
  { key: 'overview',     label: 'Overview',     icon: FiActivity },
  { key: 'jobs',         label: 'Manage Jobs',  icon: FiBriefcase },
  { key: 'applications', label: 'Applications', icon: FiFileText },
  { key: 'interviews',   label: 'Interviews',   icon: FiCalendar },
]

const BLANK_JOB = {
  title: '', description: '', department: '', branch: 'Islamabad',
  seats: 1, jobType: 'Full-time', experience: '', salaryMin: '', salaryMax: '',
  requirements: '', skills: '', deadline: '',
}

const STAT_CARDS = [
  { icon: FiBriefcase, bg: 'rgba(124,58,237,0.15)', color: '#c4b5fd', label: 'Active Jobs',   key: 'jobs' },
  { icon: FiUsers,     bg: 'rgba(79,70,229,0.15)',  color: '#818cf8', label: 'Applications', key: 'apps' },
  { icon: FiCalendar,  bg: 'rgba(124,58,237,0.12)', color: '#a78bfa', label: 'Interviews',   key: 'interviews' },
  { icon: FiAward,     bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', label: 'Selected',     key: 'selected' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('overview')

  // Job modal state — editingJob = null means "create", object means "edit"
  const [jobModal, setJobModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [jobForm, setJobForm] = useState(BLANK_JOB)

  // Application state
  const [appFilter, setAppFilter] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [statusModal, setStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [hrNotes, setHrNotes] = useState('')

  // Interview state
  const [interviewForm, setInterviewForm] = useState(null)

  // ── Queries ────────────────────────────────────────
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => getAllJobs({ limit: 50 }).then(r => r.data),
  })

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['admin-applications', appFilter],
    queryFn: () => getAllApplications({ status: appFilter, limit: 50 }).then(r => r.data),
  })

  const { data: interviewsData } = useQuery({
    queryKey: ['admin-interviews'],
    queryFn: () => getAllInterviews().then(r => r.data?.interviews || r.data || []),
  })

  const jobs = jobsData?.jobs || []
  const applications = appsData?.applications || []
  const interviews = interviewsData || []

  // ── Mutations ──────────────────────────────────────
  const createJobMutation = useMutation({
    mutationFn: (data) => createJob(data),
    onSuccess: () => {
      toast.success('Job posted successfully!')
      closeJobModal()
      queryClient.invalidateQueries(['admin-jobs'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to post job.'),
  })

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),
    onSuccess: () => {
      toast.success('Job updated successfully!')
      closeJobModal()
      queryClient.invalidateQueries(['admin-jobs'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update job.'),
  })

  const deleteJobMutation = useMutation({
    mutationFn: (id) => deleteJob(id),
    onSuccess: () => { toast.success('Job deleted.'); queryClient.invalidateQueries(['admin-jobs']) },
    onError: () => toast.error('Failed to delete job.'),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => updateApplicationStatus(id, data),
    onSuccess: () => {
      toast.success('Status updated!')
      setStatusModal(false)
      setSelectedApp(null)
      queryClient.invalidateQueries(['admin-applications'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status.'),
  })

  const scheduleInterviewMutation = useMutation({
    mutationFn: (data) => scheduleInterview(data),
    onSuccess: () => {
      toast.success('Interview scheduled and email sent!')
      setInterviewForm(null)
      queryClient.invalidateQueries(['admin-interviews'])
      queryClient.invalidateQueries(['admin-applications'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to schedule interview.'),
  })

  // ── Helpers ────────────────────────────────────────
  const openCreateModal = () => {
    setEditingJob(null)
    setJobForm(BLANK_JOB)
    setJobModal(true)
  }

  const openEditModal = (job) => {
    setEditingJob(job)
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      department: job.department || '',
      branch: job.branch || 'Islamabad',
      seats: job.seats || 1,
      jobType: job.jobType || 'Full-time',
      experience: job.experience || '',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || ''),
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || ''),
      deadline: job.deadline ? job.deadline.slice(0, 10) : '',
    })
    setJobModal(true)
  }

  const closeJobModal = () => {
    setJobModal(false)
    setEditingJob(null)
    setJobForm(BLANK_JOB)
  }

  const handleJobSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...jobForm,
      seats: Number(jobForm.seats),
      salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : undefined,
      salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : undefined,
      requirements: jobForm.requirements ? jobForm.requirements.split('\n').filter(Boolean) : [],
      skills: jobForm.skills ? jobForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob._id, data: payload })
    } else {
      createJobMutation.mutate(payload)
    }
  }

  const handleStatusUpdate = (e) => {
    e.preventDefault()
    updateStatusMutation.mutate({ id: selectedApp._id, data: { status: newStatus, hrNotes } })
  }

  const handleScheduleInterview = (e) => {
    e.preventDefault()
    if (scheduleInterviewMutation.isPending) return // prevent double submit
    // Map 'application' key → 'applicationId' as expected by backend
    const { application, ...rest } = interviewForm
    if (!application) {
      toast.error('Application ID is missing. Please close and try again.')
      return
    }
    scheduleInterviewMutation.mutate({
      applicationId: application.toString(),
      ...rest,
    })
  }

  const isMutating = createJobMutation.isPending || updateJobMutation.isPending

  const statValues = {
    jobs: jobsData?.total || 0,
    apps: appsData?.total || 0,
    interviews: interviews.length,
    selected: applications.filter(a => a.status === 'Selected').length,
  }

  return (
    <main className="page-wrapper">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #07091a 0%, #0a0f1e 60%, #0d0a22 100%)',
        padding: '2.5rem 0 0',
        borderBottom: '1px solid rgba(124,58,237,0.12)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.25rem 0.85rem', borderRadius: 50,
                background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
                fontSize: '0.75rem', color: '#c4b5fd', fontWeight: 600,
                marginBottom: '0.6rem',
              }}>
                <FiZap size={11} />
                {user?.role === 'admin' ? 'Admin Panel' : 'HR Panel'}
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, marginBottom: '0.25rem' }}>
                {user?.role === 'admin' ? 'Admin' : 'HR'} Dashboard
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Welcome back, <strong style={{ color: 'var(--text-secondary)' }}>{user?.name?.split(' ')[0]}</strong> — manage recruitment operations
              </p>
            </div>
            <button onClick={openCreateModal} className="btn-primary" style={{ borderRadius: 50, gap: '0.5rem' }}>
              <FiPlusCircle size={16} /> Post New Job
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {ADMIN_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: '0.875rem 1.25rem', background: 'none', border: 'none',
                  borderBottom: `2.5px solid ${tab === key ? 'var(--accent)' : 'transparent'}`,
                  color: tab === key ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '0.9rem', fontWeight: tab === key ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'color 0.2s, border-color 0.2s', whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  background: tab === key ? 'rgba(124,58,237,0.06)' : 'none',
                  borderRadius: '8px 8px 0 0',
                }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>

        {/* ── OVERVIEW ───────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="animate-fadeIn">
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {STAT_CARDS.map(({ icon: Icon, bg, color, label, key }) => (
                <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, background: bg,
                    border: '1px solid rgba(124,58,237,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1.875rem', fontWeight: 900, lineHeight: 1, color: '#fff' }}>{statValues[key]}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Recent Jobs */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Jobs</h3>
                  <button onClick={() => setTab('jobs')} style={{ background: 'none', border: 'none', color: 'var(--accent-light)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    View all →
                  </button>
                </div>
                {jobs.slice(0, 5).map((job, i) => (
                  <div key={job._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0',
                    borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <FiBriefcase size={14} color="#fff" />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>{truncateText(job.title, 32)}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.branch} · {job.seats} seats</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        onClick={() => openEditModal(job)}
                        style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <FiEdit2 size={12} />
                      </button>
                      <Link to={`/jobs/${job._id}`} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <FiEye size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No jobs posted yet.</p>
                )}
              </div>

              {/* Recent Applications */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Applications</h3>
                  <button onClick={() => setTab('applications')} style={{ background: 'none', border: 'none', color: 'var(--accent-light)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    View all →
                  </button>
                </div>
                {applications.slice(0, 5).map((app, i) => (
                  <div key={app._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0',
                    borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8125rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {(app.applicant?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>{app.applicant?.name || 'Applicant'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{truncateText(app.job?.title || 'Position', 30)}</p>
                      </div>
                    </div>
                    <span className={getStatusColor(app.status)} style={{ fontSize: '0.7rem' }}>{app.status}</span>
                  </div>
                ))}
                {applications.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No applications yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MANAGE JOBS ────────────────────────────────── */}
        {tab === 'jobs' && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Job Listings</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {jobsData?.total || 0} total postings
                </p>
              </div>
              <button onClick={openCreateModal} className="btn-primary" style={{ borderRadius: 50 }}>
                <FiPlusCircle size={16} /> Post New Job
              </button>
            </div>

            {jobsLoading ? <Loader fullPage={false} size={40} /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jobs.length === 0 && (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <FiBriefcase size={44} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p>No jobs posted yet. Create your first listing.</p>
                  </div>
                )}
                {jobs.map((job, i) => (
                  <div
                    key={job._id}
                    className="card animate-slideUp"
                    style={{ animationDelay: `${i * 0.04}s`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                    }}>
                      <FiBriefcase size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>{job.title}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <span>{job.department}</span>
                        <span>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiMapPin size={11} />{job.branch}</span>
                        <span>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiUsers size={11} />{job.seats} seats</span>
                        <span>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiClock size={11} />{job.jobType}</span>
                      </div>
                    </div>
                    {job.deadline && (
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: 50,
                        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                        fontSize: '0.75rem', color: '#c4b5fd', flexShrink: 0,
                      }}>
                        Deadline: {formatDate(job.deadline)}
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.85rem', borderRadius: 8, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        onClick={() => openEditModal(job)}
                      >
                        <FiEdit2 size={13} /> Edit
                      </button>
                      <Link
                        to={`/jobs/${job._id}`}
                        className="btn-ghost"
                        style={{ padding: '0.4rem 0.75rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FiEye size={14} />
                      </Link>
                      <button
                        className="btn-ghost"
                        style={{ padding: '0.4rem 0.75rem', borderRadius: 8, color: '#f87171', borderColor: 'rgba(248,113,113,0.25)' }}
                        onClick={() => { if (window.confirm('Delete this job posting?')) deleteJobMutation.mutate(job._id) }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── APPLICATIONS ───────────────────────────────── */}
        {tab === 'applications' && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Applications</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {appsData?.total || 0} total submissions
                </p>
              </div>
              <select
                value={appFilter}
                onChange={e => setAppFilter(e.target.value)}
                className="form-select"
                style={{ width: 200 }}
              >
                <option value="">All Statuses</option>
                {['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Selected'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {appsLoading ? <Loader fullPage={false} size={40} /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <FiAlertCircle size={44} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p>No applications found{appFilter ? ` with status "${appFilter}"` : ''}.</p>
                  </div>
                ) : applications.map((app, i) => (
                  <div key={app._id} className="card animate-slideUp" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9375rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
                      }}>
                        {(app.applicant?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>{app.applicant?.name || 'Applicant'}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--accent-light)', marginBottom: '0.2rem' }}>{app.job?.title}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {app.applicant?.email} · Applied {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                        <span className={getStatusColor(app.status)}>{app.status}</span>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.85rem', borderRadius: 8, fontSize: '0.8125rem' }}
                          onClick={() => { setSelectedApp(app); setNewStatus(app.status); setHrNotes(app.hrNotes || ''); setStatusModal(true) }}
                        >
                          Update
                        </button>
                        {(app.resume || app.applicant?.resume) && (
                          <a
                            href={app.resume || app.applicant?.resume}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost"
                            style={{ padding: '0.35rem 0.85rem', borderRadius: 8, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <FiFileText size={13} /> CV
                          </a>
                        )}
                        {app.status === 'Shortlisted' && (
                          <button
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.85rem', borderRadius: 8, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            onClick={() => setInterviewForm({ application: app._id, scheduledDate: '', scheduledTime: '', venue: '', mode: 'In-person', notes: '', meetingLink: '' })}
                          >
                            <FiCalendar size={13} /> Schedule
                          </button>
                        )}
                      </div>
                    </div>
                    {app.hrNotes && (
                      <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Note: {app.hrNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INTERVIEWS ─────────────────────────────────── */}
        {tab === 'interviews' && (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Scheduled Interviews</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {interviews.length} interview{interviews.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>

            {interviews.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <FiCalendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                <p style={{ marginBottom: '0.5rem' }}>No interviews scheduled yet.</p>
                <p style={{ fontSize: '0.8125rem' }}>Shortlist candidates in the Applications tab first.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {interviews.map((iv, i) => (
                  <div key={iv._id} className="card animate-slideUp" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: 50,
                        background: 'rgba(124,58,237,0.15)', color: '#c4b5fd',
                        fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(124,58,237,0.25)',
                      }}>
                        {iv.mode}
                      </span>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: 50,
                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
                        fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        {iv.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {(iv.application?.applicant?.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3 }}>
                          {iv.application?.applicant?.name || 'Candidate'}
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--accent-light)' }}>
                          {iv.application?.job?.title}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <FiCalendar size={13} color="#a78bfa" />
                        {formatDate(iv.scheduledDate)}{iv.scheduledTime && ` at ${iv.scheduledTime}`}
                      </div>
                      {iv.venue && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          <FiMapPin size={13} color="#a78bfa" /> {iv.venue}
                        </div>
                      )}
                      {iv.meetingLink && (
                        <a href={iv.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
                          <FiTrendingUp size={13} /> Join Meeting →
                        </a>
                      )}
                    </div>

                    {iv.notes && (
                      <p style={{
                        fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.875rem',
                        paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)',
                        fontStyle: 'italic', lineHeight: 1.5,
                      }}>
                        {iv.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── POST / EDIT JOB MODAL ────────────────────────── */}
      {jobModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.82)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1rem', backdropFilter: 'blur(6px)', overflowY: 'auto',
        }}>
          <div
            className="card-elevated animate-slideUp"
            style={{ width: '100%', maxWidth: 700, position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '1.5rem', position: 'sticky', top: 0,
              background: 'rgba(17,24,39,0.97)', padding: '0.75rem 0', zIndex: 1,
              borderBottom: '1px solid rgba(124,58,237,0.15)',
            }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {editingJob ? 'Edit Job Posting' : 'Post New Job'}
                </h2>
                {editingJob && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Editing: {editingJob.title}
                  </p>
                )}
              </div>
              <button
                onClick={closeJobModal}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleJobSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                  <label className="form-label">Job Title *</label>
                  <input type="text" className="form-input" placeholder="e.g. Senior Full Stack Developer" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Department *</label>
                  <input type="text" className="form-input" placeholder="e.g. Engineering" value={jobForm.department} onChange={e => setJobForm(p => ({ ...p, department: e.target.value }))} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Experience</label>
                  <input type="text" className="form-input" placeholder="e.g. 2-3 years" value={jobForm.experience} onChange={e => setJobForm(p => ({ ...p, experience: e.target.value }))} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Available Seats *</label>
                  <input type="number" className="form-input" min={1} value={jobForm.seats} onChange={e => setJobForm(p => ({ ...p, seats: e.target.value }))} required />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Application Deadline</label>
                  <input type="date" className="form-input" value={jobForm.deadline} onChange={e => setJobForm(p => ({ ...p, deadline: e.target.value }))} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Salary Min (PKR)</label>
                  <input type="number" className="form-input" placeholder="50000" value={jobForm.salaryMin} onChange={e => setJobForm(p => ({ ...p, salaryMin: e.target.value }))} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Salary Max (PKR)</label>
                  <input type="number" className="form-input" placeholder="150000" value={jobForm.salaryMax} onChange={e => setJobForm(p => ({ ...p, salaryMax: e.target.value }))} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Branch / Location *</label>
                  <select className="form-select" value={jobForm.branch} onChange={e => setJobForm(p => ({ ...p, branch: e.target.value }))}>
                    {['Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Quetta', 'Remote'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Job Type *</label>
                  <select className="form-select" value={jobForm.jobType} onChange={e => setJobForm(p => ({ ...p, jobType: e.target.value }))}>
                    {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Job Description *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the role, key responsibilities, and what the team does..."
                  value={jobForm.description}
                  onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                  required
                  style={{ minHeight: 130 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>(one per line)</span></label>
                <textarea
                  className="form-textarea"
                  placeholder={"Bachelor's degree in Computer Science\n2+ years of React experience\nStrong problem-solving skills"}
                  value={jobForm.requirements}
                  onChange={e => setJobForm(p => ({ ...p, requirements: e.target.value }))}
                  style={{ minHeight: 100 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                <input
                  type="text" className="form-input"
                  placeholder="React, Node.js, MongoDB, TypeScript, AWS"
                  value={jobForm.skills}
                  onChange={e => setJobForm(p => ({ ...p, skills: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.9rem', borderRadius: 50 }}
                  disabled={isMutating || createJobMutation.isPending || updateJobMutation.isPending}
                >
                  <FiSave size={16} />
                  {isMutating ? (editingJob ? 'Saving...' : 'Posting...') : (editingJob ? 'Save Changes' : 'Post Job')}
                </button>
                <button type="button" className="btn-ghost" onClick={closeJobModal} style={{ padding: '0.9rem 1.5rem', borderRadius: 50 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPDATE STATUS MODAL ──────────────────────────── */}
      {statusModal && selectedApp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1rem', backdropFilter: 'blur(6px)',
        }}>
          <div className="card-elevated animate-slideUp" style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Update Application</h2>
              <button onClick={() => setStatusModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiX size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {selectedApp.applicant?.name} · {selectedApp.job?.title}
            </p>

            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Selected'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes / Message to Candidate</label>
                <textarea
                  className="form-textarea"
                  placeholder="Optional message that will be sent via email..."
                  value={hrNotes}
                  onChange={e => setHrNotes(e.target.value)}
                  style={{ minHeight: 100 }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', borderRadius: 50 }}
                disabled={updateStatusMutation.isPending}
              >
                <FiCheckCircle size={16} />
                {updateStatusMutation.isPending ? 'Updating...' : 'Save & Notify Candidate'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SCHEDULE INTERVIEW MODAL ─────────────────────── */}
      {interviewForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1rem', backdropFilter: 'blur(6px)',
        }}>
          <div className="card-elevated animate-slideUp" style={{ width: '100%', maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Schedule Interview</h2>
              <button onClick={() => setInterviewForm(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" required value={interviewForm.scheduledDate} onChange={e => setInterviewForm(p => ({ ...p, scheduledDate: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Time</label>
                  <input type="time" className="form-input" value={interviewForm.scheduledTime} onChange={e => setInterviewForm(p => ({ ...p, scheduledTime: e.target.value }))} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Interview Mode</label>
                <select className="form-select" value={interviewForm.mode} onChange={e => setInterviewForm(p => ({ ...p, mode: e.target.value }))}>
                  {['In-person', 'Online', 'Phone'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {interviewForm.mode !== 'Online' && (
                <div className="form-group">
                  <label className="form-label">Venue / Location</label>
                  <input type="text" className="form-input" placeholder="e.g. Office Block B, Room 201" value={interviewForm.venue} onChange={e => setInterviewForm(p => ({ ...p, venue: e.target.value }))} />
                </div>
              )}

              {interviewForm.mode === 'Online' && (
                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input type="url" className="form-input" placeholder="https://meet.google.com/abc-xyz" value={interviewForm.meetingLink} onChange={e => setInterviewForm(p => ({ ...p, meetingLink: e.target.value }))} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Instructions / Notes to Candidate</label>
                <textarea
                  className="form-textarea"
                  placeholder="Please bring original CNIC, degree certificates, and portfolio..."
                  value={interviewForm.notes}
                  onChange={e => setInterviewForm(p => ({ ...p, notes: e.target.value }))}
                  style={{ minHeight: 90 }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', borderRadius: 50 }}
                disabled={scheduleInterviewMutation.isPending}
              >
                <FiCalendar size={16} />
                {scheduleInterviewMutation.isPending ? 'Scheduling...' : 'Schedule & Notify Candidate'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
