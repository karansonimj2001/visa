import axiosClient from './axiosClient'

export const fetchVisaTypes = (params) => axiosClient.get('/visa-types/', { params })
export const fetchVisaTypeBySlug = (slug) => axiosClient.get(`/visa-types/${slug}/`)
