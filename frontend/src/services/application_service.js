import api from './api'

/**
 * Check if the authenticated user has already applied to a specific job
 * @param {string} jobId - Job ID to check
 */
export const checkIfApplied = (jobId) => api.get(`/applications/check/${jobId}`)

/**
 * Apply for a job (multipart/form-data — supports CV upload)
 * @param {FormData} formData - FormData with jobId, coverLetter, resume file, etc.
 */
export const applyForJob = (formData) =>
  // Do NOT manually set Content-Type here.
  // When FormData is passed, Axios + the browser auto-set
  // 'multipart/form-data; boundary=...' with the correct boundary token.
  // Setting it manually strips the boundary and breaks multer parsing.
  api.post('/applications', formData)

/**
 * Get the authenticated applicant's own applications
 */
export const getMyApplications = () => api.get('/applications/my')

/**
 * Get all applications (HR/Admin only), with optional filters
 * @param {Object} params - { page, limit, status, jobId, ... }
 */
export const getAllApplications = (params = {}) =>
  api.get('/applications', { params })

/**
 * Get a single application by ID
 * @param {string} id - Application ID
 */
export const getApplicationById = (id) => api.get(`/applications/${id}`)

/**
 * Update the status of an application (HR/Admin only)
 * @param {string} id - Application ID
 * @param {Object} data - { status, remarks }
 */
export const updateApplicationStatus = (id, data) =>
  api.put(`/applications/${id}/status`, data)

/**
 * Get all applications for a specific job (HR/Admin only)
 * @param {string} jobId - Job ID
 */
export const getJobApplications = (jobId) =>
  api.get(`/applications/job/${jobId}`)