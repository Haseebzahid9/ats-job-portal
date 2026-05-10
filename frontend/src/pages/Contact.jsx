import { useState } from 'react'
import { FiPhone, FiMail, FiMapPin, FiSend, FiClock, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../services/api'

const INFO = [
  { icon: FiPhone, title: 'Phone / WhatsApp', line: '03184006367', sub: 'Mon–Sat, 9 AM – 8 PM', color: 'rgba(99,102,241,0.12)', ic: '#a5b4fc' },
  { icon: FiMail, title: 'Email', line: 'haseebzahid4998@gmail.com', sub: 'Reply within 24 hours', color: 'rgba(139,92,246,0.1)', ic: '#c4b5fd' },
  { icon: FiMapPin, title: 'Location', line: 'Pakistan', sub: 'Available nationwide online', color: 'rgba(99,102,241,0.12)', ic: '#a5b4fc' },
  { icon: FiClock, title: 'Working Hours', line: 'Mon – Sat', sub: '9:00 AM – 8:00 PM (PKT)', color: 'rgba(139,92,246,0.1)', ic: '#c4b5fd' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      await api.post('/contact', form)
      setSent(true)
      toast.success('Message sent! We\'ll get back to you within 24 hours')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-wrapper">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 60%, var(--bg-primary) 100%)',
        padding: '3.5rem 0 2.75rem',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30%', left: '-5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', right: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ display: 'inline-block', padding: '0.3rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 50, fontSize: '0.8125rem', color: 'var(--accent-light)', marginBottom: '1.25rem', fontWeight: 500 }}>
            Get in Touch
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
            We&apos;re here to <span className="text-gradient">help you</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Have a question or feedback? Send us a message and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </div>

      <div className="container section" style={{ maxWidth: 1080 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2.5rem', alignItems: 'start' }}>
          {/* Info cards */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {INFO.map(({ icon: Icon, title, line, sub, color, ic }) => (
                <div key={title} className="card" style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', padding: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: color, border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={ic} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.15rem' }}>{title}</p>
                    <p style={{ fontSize: '0.8375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{line}</p>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="card-elevated" style={{ border: '1px solid rgba(99,102,241,0.12)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
                  <FiCheckCircle size={28} color="#fff" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Message received!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.75rem', lineHeight: 1.7 }}>
                  Thank you for reaching out. We&apos;ll reply within 24 hours.
                </p>
                <button className="btn-secondary" onClick={() => setSent(false)} style={{ borderRadius: 50 }}>
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Send a Message</h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="c-name">Full Name *</label>
                      <input id="c-name" type="text" name="name" className="form-input" placeholder="Your name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="c-email">Email *</label>
                      <input id="c-email" type="email" name="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="c-subject">Subject</label>
                    <input id="c-subject" type="text" name="subject" className="form-input" placeholder="How can we help?" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="c-message">Message *</label>
                    <textarea id="c-message" name="message" className="form-textarea" placeholder="Write your question or feedback in detail..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required style={{ minHeight: 150 }} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem', borderRadius: 50, fontSize: '0.9375rem' }} disabled={loading}>
                    <FiSend size={15} />
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
