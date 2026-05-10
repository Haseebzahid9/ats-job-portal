import api from './api'

/**
 * Register a new user
 * @param {Object} data - { name, email, password, role, ... }
 */
export const register = (data) => api.post('/auth/register', data)

/**
 * Log in an existing user
 * @param {Object} data - { email, password }
 */
export const login = (data) => api.post('/auth/login', data)

/**
 * Get the authenticated user's profile
 */
export const getProfile = () => api.get('/auth/profile')

/**
 * Update the authenticated user's profile
 * @param {Object} data - profile fields to update
 */
export const updateProfile = (data) => api.put('/auth/profile', data)

/**
 * Change the authenticated user's password
 * @param {Object} data - { currentPassword, newPassword }
 */
export const changePassword = (data) => api.put('/auth/change-password', data)

/**
 * Upload a profile picture (multipart/form-data)
 * @param {FormData} formData - FormData with 'profilePicture' field
 */
export const uploadProfilePicture = (formData) =>
  api.post('/auth/upload-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
