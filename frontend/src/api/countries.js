import axiosClient from './axiosClient'

export const fetchCountries = () => axiosClient.get('/countries/')
export const fetchCountryBySlug = (slug) => axiosClient.get(`/countries/${slug}/`)
