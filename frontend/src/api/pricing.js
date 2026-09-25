import axiosClient from './axiosClient'

export const fetchPricing = (params) => axiosClient.get('/pricing/', { params })
