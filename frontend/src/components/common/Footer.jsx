import { Link } from 'react-router-dom'
import { FiBriefcase, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa'
import styles from './Footer.module.css'

const SEEKER_LINKS = [
  { to: '/jobs', label: 'Browse Jobs' },
  { to: '/jobs?view=categories', label: 'Browse Categories' },
  { to: '/jobs?alerts=true', label: 'Job Alerts' },
  { to: '/success-stories', label: 'Career Resources' },
]

const COMPANY_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/privacy', label: 'Privacy Policy' },
]

const SOCIAL = [
  { icon: <FaFacebookF size={14} />, href: '#', label: 'Facebook' },
  { icon: <FaTwitter size={14} />, href: '#', label: 'Twitter' },
  { icon: <FaLinkedinIn size={14} />, href: '#', label: 'LinkedIn' },
  { icon: <FaInstagram size={14} />, href: '#', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        {/* Brand column */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <FiBriefcase size={18} />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Jobs Portal</span>
              <span className={styles.logoSub}>by Haseeb Zahid</span>
            </div>
          </Link>
          <p className={styles.description}>
            Your career starts here. Connecting talented professionals with top employers
            across Pakistan. Apply smarter, faster, and better.
          </p>
          <div className={styles.social}>
            {SOCIAL.map(({ icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className={styles.socialIcon} aria-label={label}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* For Job Seekers */}
        <div className={styles.linksCol}>
          <h4 className={styles.colHeading}>For Job Seekers</h4>
          <ul className={styles.linkList}>
            {SEEKER_LINKS.map(({ to, label }) => (
              <li key={label}><Link to={to} className={styles.footerLink}>{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className={styles.linksCol}>
          <h4 className={styles.colHeading}>Company</h4>
          <ul className={styles.linkList}>
            {COMPANY_LINKS.map(({ to, label }) => (
              <li key={label}><Link to={to} className={styles.footerLink}>{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.linksCol}>
          <h4 className={styles.colHeading}>Contact Us</h4>
          <ul className={styles.contactList}>
            <li>
              <FiPhone size={14} className={styles.contactIcon} />
              <a href="tel:03184006367" className={styles.footerLink}>03184006367</a>
            </li>
            <li>
              <FiMail size={14} className={styles.contactIcon} />
              <a href="mailto:haseebzahid4998@gmail.com" className={styles.footerLink}>
                haseebzahid4998@gmail.com
              </a>
            </li>
            <li className={styles.address}>
              <FiMapPin size={14} className={styles.contactIcon} style={{ flexShrink: 0, marginTop: 3 }} />
              <span className={styles.footerLink}>Pakistan</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.copyright}>
            &copy; 2026 Jobs Portal · Haseeb Zahid · All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
