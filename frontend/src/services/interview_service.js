import api from './api'

/**
 * Schedule a new interview
 * @param {Object} data - { applicationId, date, time, mode, location, notes }
 */
export const scheduleInterview = (data) => api.post('/interviews', data)

/**
 * Get interview details for a specific application
 * @param {string} appId - Application ID
 */
export const getInterviewByApplication = (appId) =>
  api.get(`/interviews/application/${appId}`)

/**
 * Update interview details
 * @param {string} id - Interview ID
 * @param {Object} data - fields to update
 */
export const updateInterview = (id, data) => api.put(`/interviews/${id}`, data)

/**
 * Get all interviews (HR/Admin only)
 */
export const getAllInterviews = () => api.get('/interviews')
