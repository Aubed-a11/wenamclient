import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.wenamfood.com/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
          .catch((err) => Promise.reject(err))
      }
      original._retry = true
      isRefreshing = true
      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const { accessToken } = data
        localStorage.setItem('accessToken', accessToken)
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)
        return api(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
