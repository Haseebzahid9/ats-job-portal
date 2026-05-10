import api from './api'

/**
 * Get all jobs with optional query params (pagination, filters, search)
 * @param {Object} params - { page, limit, search, location, category, type, ... }
 */
export const getAllJobs = (params = {}) => api.get('/jobs', { params })

/**
 * Get a single job by ID
 * @param {string} id - Job ID
 */
export const getJobById = (id) => api.get(`/jobs/${id}`)

/**
 * Create a new job posting (HR/Admin only)
 * @param {Object} data - job details
 */
export const createJob = (data) => api.post('/jobs', data)

/**
 * Update a job posting
 * @param {string} id - Job ID
 * @param {Object} data - fields to update
 */
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data)

/**
 * Delete a job posting
 * @param {string} id - Job ID
 */
export const deleteJob = (id) => api.delete(`/jobs/${id}`)

/**
 * Get jobs posted by the currently authenticated HR/Admin user
 */
export const getMyPostedJobs = () => api.get('/jobs/my/posted')
