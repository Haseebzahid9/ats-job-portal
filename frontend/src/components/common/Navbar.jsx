import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiBriefcase, FiChevronDown, FiMenu, FiX, FiUser, FiLogOut, FiLayout, FiSun, FiMoon } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { getInitials } from '../../utils/helpers'
import styles from './Navbar.module.css'

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/jobs', label: 'Find Jobs' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)
  const { theme, toggle: toggleTheme } = useTheme()

  // Track scroll position to add shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    setMobileOpen(false)
    navigate('/login')
  }

  const closeMobile = () => setMobileOpen(false)

  const avatarContent = user?.profilePicture ? (
    <img
      src={user.profilePicture}
      alt={user.name}
      className={styles.avatarImg}
    />
  ) : (
    <span className={styles.avatarInitials}>
      {getInitials(user?.name || 'User')}
    </span>
  )

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link to="/" className={styles.logo} onClick={closeMobile}>
            <div className={styles.logoIcon}>
              <FiBriefcase size={20} />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Jobs Portal</span>
              <span className={styles.logoSub}>by Haseeb Zahid</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <ul className={styles.navLinks}>
            {NAV_LINKS.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop auth */}
          <div className={styles.authArea}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'rgba(99,102,241,0.1)',
                border: '1.5px solid rgba(99,102,241,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--accent-light)',
                transition: 'background 0.2s, border-color 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)' }}
            >
              {theme === 'dark' ? <FiSun size={15} /> : <FiMoon size={15} />}
            </button>

            {isAuthenticated ? (
              <div className={styles.userDropdown} ref={dropdownRef}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setDropdownOpen((p) => !p)}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  <div className={styles.avatar}>{avatarContent}</div>
                  <span className={styles.userName}>
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <FiChevronDown
                    size={15}
                    className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{user?.name}</p>
                      <p className={styles.dropdownEmail}>{user?.email}</p>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link
                      to="/dashboard"
                      className={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiLayout size={15} />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      className={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser size={15} />
                      Profile
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                      onClick={handleLogout}
                    >
                      <FiLogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}>
        <ul className={styles.mobileNavLinks}>
          {NAV_LINKS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${styles.mobileNavLink} ${isActive ? styles.active : ''}`
                }
                onClick={closeMobile}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.mobileDivider} />

        {isAuthenticated ? (
          <div className={styles.mobileAuth}>
            <div className={styles.mobileUser}>
              <div className={styles.avatar} style={{ width: 38, height: 38 }}>
                {avatarContent}
              </div>
              <div>
                <p className={styles.dropdownName}>{user?.name}</p>
                <p className={styles.dropdownEmail}>{user?.email}</p>
              </div>
            </div>
            <Link to="/dashboard" className={styles.mobileNavLink} onClick={closeMobile}>
              <FiLayout size={15} /> Dashboard
            </Link>
            <Link to="/dashboard/profile" className={styles.mobileNavLink} onClick={closeMobile}>
              <FiUser size={15} /> Profile
            </Link>
            <button
              className={`${styles.mobileNavLink} ${styles.mobileLogout}`}
              onClick={handleLogout}
            >
              <FiLogOut size={15} /> Logout
            </button>
          </div>
        ) : (
          <div className={styles.mobileAuthBtns}>
            <Link to="/login" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={closeMobile}>
              Sign In
            </Link>
            <Link to="/register" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={closeMobile}>
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={closeMobile} aria-hidden="true" />
      )}
    </>
  )
}
