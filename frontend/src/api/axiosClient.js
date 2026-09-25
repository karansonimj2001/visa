import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.code
    const message = (error.response?.data?.error || error.message || 'Something went wrong') + (code ? ` [${code}]` : '')
    const err = new Error(message)
    err.details = error.response?.data?.details
    err.status = error.response?.status
    return Promise.reject(err)
  }
)

export default axiosClient
