import axiosClient from './axiosClient'

export const fetchDestinations = () => axiosClient.get('/destinations/')
export const fetchDestinationBySlug = (slug) => axiosClient.get(`/destinations/${slug}/`)
