import axios from "axios"

const CLIENT_ID_APP1 = "vFNeSjouVzhE7gpdTBsUOFjPayJfjjOdy2fgJsaO"

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
})

// Request interceptor — แนบ token ให้ทุก request อัตโนมัติ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
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
          client_id: CLIENT_ID_APP1, 
        }

        // ขอ access_token ใหม่จาก Django
        const res = await axios.post(
          "http://localhost:8000/o/token/",
          new URLSearchParams(payload),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            withCredentials: true,
          }
        )

        const newAccessToken = res.data.access_token
        localStorage.setItem("access_token", newAccessToken)

        // retry request เดิมด้วย token ใหม่
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // refresh ไม่ได้ → ล้างข้อมูลทั้งหมดในเครื่อง
        localStorage.removeItem("access_token")
        localStorage.removeItem("username")
        localStorage.removeItem("user_email")

        window.location.href = "/"
      }
    }

    return Promise.reject(error)
  }
)

export default api