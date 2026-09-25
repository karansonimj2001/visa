import axiosClient from './axiosClient'

export const submitApplication = (formData) => axiosClient.post('/applications/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const trackApplication = (ref) => axiosClient.get('/applications/track/', { params: { ref } })
export const createRazorpayOrder = (data) => axiosClient.post('/payments/create-order/', data)
