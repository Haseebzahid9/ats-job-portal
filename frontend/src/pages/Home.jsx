import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiSearch, FiBriefcase, FiArrowRight, FiShield, FiBell,
  FiTarget, FiAward, FiMapPin, FiClock, FiUsers,
  FiCheckCircle, FiStar, FiChevronRight, FiHelpCircle
} from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { getAllJobs } from '../services/job_service'
import { formatDate } from '../utils/helpers'
import styles from './Home.module.css'

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

const FEATURES = [
  { icon: FiShield,       title: 'Verified Jobs',   desc: 'All postings carefully curated' },
  { icon: FiBell,         title: 'Instant Alerts',  desc: 'Get notified immediately' },
  { icon: FiTarget,       title: 'Easy Apply',      desc: 'One-click application process' },
  { icon: FiAward,        title: 'Career Growth',   desc: 'Build your future today' },
  { icon: FiHelpCircle,   title: 'Need Help?',      isHelp: true },
]

const WHY_CHOOSE = [
  { icon: FiShield,      title: 'Quality Job Listings',      desc: 'Every listing is reviewed and verified before going live on the platform' },
  { icon: FiBell,        title: 'Real-time Notifications',    desc: 'Get instant email alerts when your application status changes' },
  { icon: FiTarget,      title: 'Smart Profile Builder',      desc: 'Build a comprehensive CV profile visible to top hiring managers' },
  { icon: FiUsers,       title: 'Merit-Based Selection',      desc: 'Fair, transparent hiring based solely on qualifications and experience' },
  { icon: FiCheckCircle, title: 'Application Tracking',       desc: 'Monitor your status from submission right through to final selection' },
  { icon: FiAward,       title: 'Career Resources',           desc: 'Access tips, guides, and tools to land your dream IT/CS job' },
]

const STORIES = [
  {
    name: 'Ali Ahmed', role: 'Full Stack Developer', company: 'TechCorp Pakistan',
    quote: 'Jobs Portal made my job search effortless. I got shortlisted within 48 hours and the application process was incredibly smooth.',
    rating: 5,
  },
  {
    name: 'Fatima Khan', role: 'Data Scientist', company: 'Analytics Co.',
    quote: "I tracked my application status in real time and received timely notifications at every step. The portal's UX is simply top-notch!",
    rating: 5,
  },
  {
    name: 'Hassan Raza', role: 'DevOps Engineer', company: 'CloudBase Ltd.',
    quote: 'A merit-based system that actually values your skills. I was selected for my dream job within two weeks of applying here.',
    rating: 5,
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [branch, setBranch] = useState('')
  const [jobType, setJobType] = useState('')
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)

  const { data: latestJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['home-jobs'],
    queryFn: () => getAllJobs({ limit: 6 }).then(r => r.data?.jobs || []),
    staleTime: 60000,
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.4 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const c1 = useCountUp(227, 1800, statsVisible)
  const c2 = useCountUp(213, 1800, statsVisible)
  const c3 = useCountUp(1736223, 2000, statsVisible)

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (branch) params.set('branch', branch)
    if (jobType) params.set('jobType', jobType)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <main className="page-wrapper">

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
          <div className={styles.gridLines} />
        </div>

        <div className={`container ${styles.heroInner}`}>
          {/* Left */}
          <div className={`${styles.heroLeft} animate-slideInLeft`}>
            <div className={styles.heroPill}>
              <span className={styles.pillDot} />
              Pakistan's #1 IT/CS Jobs Platform
            </div>

            <h1 className={styles.heroTitle}>
              Your Dream Tech Job
              <br />
              <span className="text-gradient">Starts Right Here.</span>
            </h1>

            <p className={styles.heroSub}>
              Discover top IT & Computer Science opportunities across Pakistan.
              Apply instantly, track your status, and launch your tech career with us.
            </p>

            <Link to="/jobs" className={`btn-primary ${styles.heroBtn}`}>
              <FiSearch size={18} />
              Start Job Search
              <FiArrowRight size={16} />
            </Link>

            <div ref={statsRef} className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.statNum}>{c1}+</span>
                <span className={styles.statLabel}>Active Jobs</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.heroStat}>
                <span className={styles.statNum}>{c2}+</span>
                <span className={styles.statLabel}>Departments</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.heroStat}>
                <span className={styles.statNum}>{(c3 / 1000000).toFixed(1)}M+</span>
                <span className={styles.statLabel}>Happy Users</span>
              </div>
            </div>
          </div>

          {/* Right – feature cards */}
          <div className={`${styles.heroRight} animate-slideInRight`}>
            <div className={styles.featuresGrid}>
              {FEATURES.filter(f => !f.isHelp).map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={styles.featureIcon}><Icon size={20} /></div>
                  <p className={styles.featureTitle}>{title}</p>
                  <p className={styles.featureDesc}>{desc}</p>
                </div>
              ))}
            </div>

            <div className={styles.helpCard}>
              <div className={styles.helpIconWrap}><FiHelpCircle size={18} /></div>
              <div>
                <p className={styles.helpTitle}>Need Help?</p>
                <p className={styles.helpInfo}>Email: haseebzahid4998@gmail.com</p>
                <p className={styles.helpInfo}>Phone: 03184006367</p>
                <Link to="/contact" className={styles.helpLink}>Open Support Form →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEARCH ────────────────────────────────────────── */}
      <section className={styles.searchSection}>
        <div className="container">
          <h2 className={styles.searchHeading}>JOB SEARCH</h2>
          <p className={styles.searchSub}>Search from top IT, CS, and tech opportunities across Pakistan</p>

          <form onSubmit={handleSearch} className={styles.searchBox}>
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <FiSearch size={17} className={styles.fieldIcon} />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.searchField}>
                <FiMapPin size={17} className={styles.fieldIcon} />
                <select value={branch} onChange={e => setBranch(e.target.value)} className={styles.searchSelect}>
                  <option value="">City, province, or region</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div className={styles.searchField}>
                <FiBriefcase size={17} className={styles.fieldIcon} />
                <select value={jobType} onChange={e => setJobType(e.target.value)} className={styles.searchSelect}>
                  <option value="">Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className={styles.searchRow2}>
              <select className={styles.searchSelect2}>
                <option value="">Experience</option>
                <option>0-1 years</option>
                <option>1-3 years</option>
                <option>3-5 years</option>
                <option>5+ years</option>
              </select>
              <select className={styles.searchSelect2}>
                <option value="">Salary Range</option>
                <option>Up to PKR 50,000</option>
                <option>PKR 50K – 100K</option>
                <option>PKR 100K – 200K</option>
                <option>PKR 200K+</option>
              </select>
              <button type="submit" className={`btn-primary ${styles.searchBtn}`}>
                <FiSearch size={17} />
                Search Jobs
              </button>
            </div>

            <div className={styles.popular}>
              <span className={styles.popularLabel}>Popular:</span>
              {['Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'UI/UX Designer', 'Cybersecurity'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/jobs?search=${encodeURIComponent(tag)}`)}
                  className={styles.popularTag}
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* ─── LATEST JOBS ───────────────────────────────────── */}
      <section className={`section ${styles.latestSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>
                Latest <span className="text-gradient">IT/CS Jobs</span>
              </h2>
              <p className={styles.sectionSub}>Fresh opportunities posted today</p>
            </div>
            <Link to="/jobs" className="btn-primary">View All <FiArrowRight size={15} /></Link>
          </div>

          <div className={styles.jobsGrid}>
            {jobsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`${styles.jobSkeleton} skeleton`} />
                ))
              : (latestJobs || []).map((job, i) => (
                  <div
                    key={job._id}
                    className={`${styles.jobCard} animate-slideUp`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className={styles.jobCardInner}>
                      <button className={styles.bookmarkBtn} aria-label="Bookmark job">
                        <svg width="13" height="16" viewBox="0 0 13 16" fill="none">
                          <path d="M1 1h11v14l-5.5-3-5.5 3V1z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <p className={styles.jobDept}>{job.department}</p>
                      <div className={styles.jobMeta}>
                        <FiBriefcase size={13} />
                        <span>{job.jobType || 'Full-time'}</span>
                        {job.branch && (
                          <>
                            <span className={styles.dot}>·</span>
                            <FiMapPin size={13} />
                            <span>{job.branch}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={styles.jobCardFooter}>
                      <div className={styles.jobSeats}>
                        <FiUsers size={13} />
                        <span>{job.seats} seat{job.seats !== 1 ? 's' : ''}</span>
                      </div>
                      <Link to={`/jobs/${job._id}`} className={`btn-primary ${styles.applyBtn}`}>
                        Apply
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE ────────────────────────────────────── */}
      <section className={`section ${styles.whySection}`}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className={styles.sectionTitle}>
              Why Choose <span className="text-gradient">Jobs Portal?</span>
            </h2>
            <p className={styles.sectionSub}>Pakistan's growing platform for tech and IT careers</p>
          </div>
          <div className={styles.whyGrid}>
            {WHY_CHOOSE.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className={`${styles.whyCard} animate-slideUp`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.whyIcon}><Icon size={22} /></div>
                <h3 className={styles.whyTitle}>{title}</h3>
                <p className={styles.whyDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUCCESS STORIES ───────────────────────────────── */}
      <section className={`section ${styles.storiesSection}`}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className={styles.sectionTitle}>
              <span className="text-gradient">Success</span> Stories
            </h2>
            <p className={styles.sectionSub}>Hear from those who found their dream jobs through our platform</p>
          </div>
          <div className={styles.storiesGrid}>
            {STORIES.map(({ name, role, company, quote, rating }, i) => (
              <div key={name} className={`${styles.storyCard} animate-slideUp`} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className={styles.storyStars}>
                  {Array.from({ length: rating }).map((_, j) => (
                    <FiStar key={j} size={15} fill="#f59e0b" stroke="#f59e0b" />
                  ))}
                </div>
                <div className={styles.bigQuote}>"</div>
                <p className={styles.storyQuote}>"{quote}"</p>
                <div className={styles.storyAuthor}>
                  <div className={styles.storyAvatar}>
                    {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className={styles.storyName}>{name}</p>
                    <p className={styles.storyRole}>{role}</p>
                    <p className={styles.storyCompany}>{company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/success-stories" className="btn-secondary">
              Read More Stories <FiChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className={styles.ctaTitle}>Ready to Start Your Journey?</h2>
          <p className={styles.ctaSub}>
            Join thousands of tech professionals who launched their careers through Jobs Portal
          </p>
          <Link to="/register" className={`btn-primary ${styles.ctaBtn}`}>
            Get Started Now <FiArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  )
}
