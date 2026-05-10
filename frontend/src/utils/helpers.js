/**
 * Format a date value into a human-readable string.
 * @param {string|Date|number} date
 * @returns {string}  e.g. "January 15, 2026"
 */
export function formatDate(date) {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid date'
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a salary range into a readable Pakistani-style string.
 * @param {number|string} min
 * @param {number|string} max
 * @returns {string}  e.g. "PKR 50,000 - 100,000"
 */
export function formatSalary(min, max) {
  if (!min && !max) return 'Salary not specified'
  const fmt = (val) =>
    Number(val).toLocaleString('en-PK', { maximumFractionDigits: 0 })
  if (min && max) return `PKR ${fmt(min)} - ${fmt(max)}`
  if (min) return `PKR ${fmt(min)}+`
  return `Up to PKR ${fmt(max)}`
}

/**
 * Return the CSS class name for a given application status badge.
 * @param {string} status
 * @returns {string}
 */
export function getStatusColor(status) {
  if (!status) return 'badge badge-submitted'
  const normalized = status.toLowerCase().replace(/\s+/g, '-')
  const map = {
    submitted: 'badge badge-submitted',
    'under-review': 'badge badge-under-review',
    shortlisted: 'badge badge-shortlisted',
    'interview-scheduled': 'badge badge-interview-scheduled',
    rejected: 'badge badge-rejected',
    selected: 'badge badge-selected',
  }
  return map[normalized] || 'badge badge-submitted'
}

/**
 * Truncate a string to a maximum length, appending an ellipsis if needed.
 * @param {string} text
 * @param {number} [length=120]
 * @returns {string}
 */
export function truncateText(text, length = 120) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

/**
 * Extract initials from a full name (up to two characters).
 * @param {string} name
 * @returns {string}  e.g. "Ali Hassan" → "AH"
 */
export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
