import { FiStar } from 'react-icons/fi'
import { getInitials } from '../utils/helpers'

const STORIES = [
  {
    id: 1,
    name: 'Fatima Malik',
    role: 'Software Engineer',
    company: 'National IT Board',
    quote: 'NJP helped me land my dream government job in just three weeks. The platform is incredibly easy to use and the process was transparent throughout.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Ahmed Raza',
    role: 'Project Manager',
    company: 'NADRA',
    quote: 'After months of searching, I found the perfect opportunity through NJP. The interview scheduling feature made coordination effortless.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Sara Khan',
    role: 'Data Analyst',
    company: 'Ministry of Finance',
    quote: 'The portal streamlined my entire job search. I applied to 5 positions and got shortlisted for 3. Highly recommend to all fresh graduates.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Bilal Hussain',
    role: 'Civil Engineer',
    company: 'NHA',
    quote: 'Professional, efficient, and completely free to use. NJP is a game-changer for government job seekers in Pakistan.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Zainab Ali',
    role: 'HR Specialist',
    company: 'Federal Public Service Commission',
    quote: 'As an HR professional, I appreciate how NJP makes it easy to post jobs and manage applications all in one place.',
    rating: 4,
  },
  {
    id: 6,
    name: 'Usman Tariq',
    role: 'Financial Analyst',
    company: 'State Bank of Pakistan',
    quote: 'Found my current role at SBP through NJP. The resume parsing and cover letter tools saved me hours of preparation time.',
    rating: 5,
  },
]

export default function SuccessStories() {
  return (
    <main className="page-wrapper">
      <div className="container section">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.75rem' }}>
            Success Stories
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', fontSize: '1.0625rem' }}>
            Real people. Real careers. Discover how NJP has helped thousands of
            professionals find their dream government jobs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {STORIES.map(({ id, name, role, company, quote, rating }, i) => (
            <div
              key={id}
              className={`card animate-slideUp delay-${Math.min(i + 1, 5) * 100}`}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <FiStar
                    key={s}
                    size={14}
                    color={s < rating ? '#fbbf24' : 'var(--text-muted)'}
                    fill={s < rating ? '#fbbf24' : 'none'}
                  />
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75, fontStyle: 'italic', flex: 1 }}>
                &ldquo;{quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4d7c3f, #6ea84d)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0
                }}>
                  {getInitials(name)}
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{name}</p>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{role} · {company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
