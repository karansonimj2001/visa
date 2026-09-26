import axiosClient from './axiosClient'

export const fetchSettings = () => axiosClient.get('/settings/')
export const fetchFaqs = (params) => axiosClient.get('/faqs/', { params })
export const fetchRequirements = (params) => axiosClient.get('/requirements/', { params })
