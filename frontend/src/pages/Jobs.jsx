import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiSearch, FiMapPin, FiBriefcase, FiClock, FiUsers,
  FiFilter, FiX, FiChevronLeft, FiChevronRight, FiRefreshCw,
  FiDollarSign,
} from 'react-icons/fi'
import { getAllJobs } from '../services/job_service'
import { formatSalary, formatDate, truncateText } from '../utils/helpers'
import Loader from '../components/common/Loader'

const BRANCHES = ['All Locations', 'Islamabad', 'Lahore', 'Karachi', 'Remote']
const JOB_TYPES = ['All Types', 'Full-Time', 'Part-Time', 'Contract', 'Internship']

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [branch, setBranch] = useState(searchParams.get('branch') || '')
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [inputVal, setInputVal] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const s = searchParams.get('search') || ''
    const b = searchParams.get('branch') || ''
    const j = searchParams.get('jobType') || ''
    setSearch(s); setInputVal(s)
    setBranch(b); setJobType(j)
    setPage(1)
  }, [searchParams])

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['jobs', search, branch, jobType, page],
    queryFn: () => getAllJobs({ search, branch, jobType, page, limit: 9 }).then(r => r.data),
    keepPreviousData: true,
  })

  const jobs = data?.jobs || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  const applySearch = (e) => {
    e?.preventDefault()
    setSearch(inputVal)
    setPage(1)
    const p = new URLSearchParams()
    if (inputVal) p.set('search', inputVal)
    if (branch) p.set('branch', branch)
    if (jobType) p.set('jobType', jobType)
    setSearchParams(p)
  }

  const clearFilters = () => {
    setSearch(''); setInputVal(''); setBranch(''); setJobType(''); setPage(1)
    setSearchParams({})
  }

  const hasFilters = search || branch || jobType

  return (
    <main className="page-wrapper">
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #07091a 0%, #0a0f1e 60%, #0d0a22 100%)',
        padding: '3.5rem 0 2.75rem',
        borderBottom: '1px solid rgba(124,58,237,0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', right: '-5%',
          width: 450, height: 450, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '-5%',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '0.4rem' }}>
            <span style={{
              display: 'inline-block', padding: '0.25rem 0.875rem',
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 50, fontSize: '0.8125rem', color: '#c4b5fd', fontWeight: 500,
            }}>
              IT & Computer Science Jobs
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '0.5rem' }}>
            Find Your Perfect <span className="text-gradient">Tech Role</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.0625rem', marginBottom: '2.25rem' }}>
            {total > 0 ? `${total.toLocaleString()} positions available` : 'Browsing all available positions'}
          </p>

          {/* Search bar */}
          <form onSubmit={applySearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', maxWidth: 760 }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FiSearch size={17} style={{ position: 'absolute', left: '1.1rem', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1 }} />
              <input
                type="text"
                placeholder="Job title, skills, keywords..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                style={{
                  width: '100%', padding: '0.875rem 1.1rem 0.875rem 3rem',
                  background: 'rgba(13,18,35,0.85)',
                  border: '1.5px solid rgba(124,58,237,0.2)',
                  borderRadius: 50, color: '#fff', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.2)'; e.target.style.boxShadow = '' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ borderRadius: 50, padding: '0.875rem 2rem', fontSize: '1rem' }}>
              <FiSearch size={17} /> Search
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(p => !p)}
              className={filtersOpen ? 'btn-primary' : 'btn-secondary'}
              style={{ borderRadius: 50, padding: '0.875rem 1.375rem' }}
            >
              <FiFilter size={16} /> Filters
              {hasFilters && <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#a78bfa', display: 'inline-block', marginLeft: 4
              }} />}
            </button>
          </form>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.25rem', paddingBottom: '5rem' }}>
        {/* Filters panel */}
        {filtersOpen && (
          <div className="card animate-slideUp" style={{ marginBottom: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
              <select
                className="form-select"
                value={branch}
                onChange={e => { setBranch(e.target.value === 'All Locations' ? '' : e.target.value); setPage(1) }}
              >
                {BRANCHES.map(b => <option key={b} value={b === 'All Locations' ? '' : b}>{b}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Type</label>
              <select
                className="form-select"
                value={jobType}
                onChange={e => { setJobType(e.target.value === 'All Types' ? '' : e.target.value); setPage(1) }}
              >
                {JOB_TYPES.map(t => <option key={t} value={t === 'All Types' ? '' : t}>{t}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                <FiX size={14} /> Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active filters:</span>
            {[search && { label: search, key: 'search' }, branch && { label: branch, key: 'branch' }, jobType && { label: jobType, key: 'jobType' }]
              .filter(Boolean)
              .map(({ label, key }) => (
                <span key={key} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.3rem 0.875rem',
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: 50, fontSize: '0.875rem', color: '#c4b5fd',
                }}>
                  {label}
                  <button
                    onClick={() => {
                      if (key === 'search') { setSearch(''); setInputVal('') }
                      if (key === 'branch') setBranch('')
                      if (key === 'jobType') setJobType('')
                      setPage(1)
                    }}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && <div style={{ padding: '5rem 0', display: 'flex', justifyContent: 'center' }}><Loader fullPage={false} size={52} /></div>}

        {/* Error */}
        {isError && !isLoading && (
          <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <FiRefreshCw size={42} style={{ margin: '0 auto 1.25rem', opacity: 0.35 }} />
            <p style={{ marginBottom: '1rem', fontSize: '1.0625rem' }}>Failed to load jobs. Please try again.</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Results info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
                {isFetching ? 'Loading…' : `Showing ${jobs.length} of ${total} job${total !== 1 ? 's' : ''}`}
              </p>
            </div>

            {jobs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                <FiBriefcase size={60} style={{ margin: '0 auto 1.5rem', opacity: 0.18 }} />
                <h3 style={{ fontSize: '1.375rem', marginBottom: '0.6rem', color: 'var(--text-secondary)' }}>No Jobs Found</h3>
                <p style={{ marginBottom: '1.75rem', fontSize: '1rem' }}>Try adjusting your search or clearing filters.</p>
                <button onClick={clearFilters} className="btn-secondary">Clear All Filters</button>
              </div>
            ) : (
              /* 3-per-row grid */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
              }}>
                {jobs.map((job, i) => (
                  <JobCard key={job._id} job={job} delay={i * 0.07} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-ghost"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FiChevronLeft size={16} /> Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
                  const p = totalPages <= 7 ? idx + 1 : (page <= 4 ? idx + 1 : page - 3 + idx)
                  if (p < 1 || p > totalPages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        border: `1.5px solid ${p === page ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                        background: p === page ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'transparent',
                        color: p === page ? '#fff' : 'var(--text-secondary)',
                        fontSize: '0.9375rem', fontWeight: p === page ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: p === page ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                      }}
                      onMouseEnter={e => { if (p !== page) e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)' }}
                      onMouseLeave={e => { if (p !== page) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  className="btn-ghost"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 1024px) {
          .jobs-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .jobs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}

function JobCard({ job, delay }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="animate-slideUp"
      style={{
        animationDelay: `${delay}s`,
        background: hovered ? 'rgba(17,24,39,0.95)' : 'rgba(17,24,39,0.82)',
        border: `1px solid ${hovered ? 'rgba(124,58,237,0.42)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20,
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'border-color 0.28s, transform 0.28s, box-shadow 0.28s, background 0.28s',
        transform: 'none',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(124,58,237,0.1)' : 'none',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Job type badge */}
      <div style={{ position: 'absolute', top: '1.375rem', right: '1.375rem' }}>
        <span style={{
          padding: '0.25rem 0.8rem', borderRadius: 50,
          fontSize: '0.75rem', fontWeight: 700,
          background: hovered ? 'rgba(124,58,237,0.22)' : 'rgba(124,58,237,0.12)',
          color: '#c4b5fd',
          border: `1px solid ${hovered ? 'rgba(124,58,237,0.45)' : 'rgba(124,58,237,0.22)'}`,
          transition: 'all 0.28s',
        }}>
          {job.jobType || 'Full-Time'}
        </span>
      </div>

      {/* Department icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: hovered
          ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
          : 'rgba(124,58,237,0.12)',
        border: `1px solid ${hovered ? 'transparent' : 'rgba(124,58,237,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.28s',
        boxShadow: hovered ? '0 6px 18px rgba(124,58,237,0.35)' : 'none',
        flexShrink: 0,
      }}>
        <FiBriefcase size={20} color={hovered ? '#fff' : '#a78bfa'} />
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '4rem' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, lineHeight: 1.35, color: '#fff' }}>{job.title}</h3>
        <p style={{ fontSize: '0.875rem', color: '#a78bfa', fontWeight: 600 }}>{job.department}</p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
          {truncateText(job.description, 95)}
        </p>
      </div>

      {/* Meta chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {job.branch && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.8125rem', color: 'var(--text-muted)',
            padding: '0.25rem 0.75rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 50,
          }}>
            <FiMapPin size={12} /> {job.branch}
          </span>
        )}
        {job.experience && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.8125rem', color: 'var(--text-muted)',
            padding: '0.25rem 0.75rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 50,
          }}>
            <FiClock size={12} /> {job.experience}
          </span>
        )}
        {(job.salaryMin || job.salaryMax) && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.8125rem', color: 'var(--text-muted)',
            padding: '0.25rem 0.75rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 50,
          }}>
            <FiDollarSign size={12} /> {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '0.875rem',
        borderTop: `1px solid ${hovered ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.28s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <FiUsers size={13} />
          <span>{job.seats} seat{job.seats !== 1 ? 's' : ''}</span>
        </div>
        <Link
          to={`/jobs/${job._id}`}
          className="btn-primary"
          style={{ padding: '0.45rem 1.25rem', fontSize: '0.875rem', borderRadius: 50 }}
          onClick={e => e.stopPropagation()}
        >
          View & Apply
        </Link>
      </div>
    </div>
  )
}
