import axios from "axios"
import { CLIENT_ID, API_BASE_URL, TOKEN_URL, STORAGE_KEYS } from "@/shared/lib/constants"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Request interceptor — แนบ token ให้ทุก request อัตโนมัติ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 (token หมดอายุ)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const payload = {
          grant_type: "refresh_token",
          client_id: CLIENT_ID,
        }

        // ขอ access_token ใหม่จาก Django
        const res = await axios.post(
          TOKEN_URL,
          new URLSearchParams(payload),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            withCredentials: true,
          }
        )

        const newAccessToken = res.data.access_token
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)

        // retry request เดิมด้วย token ใหม่
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // refresh ไม่ได้ → ล้างข้อมูลทั้งหมดในเครื่อง
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USERNAME)
        localStorage.removeItem(STORAGE_KEYS.USER_EMAIL)

        window.location.href = "/"
      }
    }

    return Promise.reject(error)
  }
)

export default api
