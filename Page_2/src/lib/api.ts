import axios from "axios"

const CLIENT_ID_APP2 = "czcgWBuoNW42t4aGzLJdOoJe42ZftoCYw6z4bzlH"

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
        const refreshToken = localStorage.getItem("refresh_token")

        // ขอ access_token ใหม่จาก Django
        const res = await axios.post(
          "http://localhost:8000/o/token/",
          {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: CLIENT_ID_APP2,
          },
          { withCredentials: true }
        )

        const newAccessToken = res.data.access_token
        localStorage.setItem("access_token", newAccessToken)

        // retry request เดิมด้วย token ใหม่
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // refresh ไม่ได้ → ล้าง token ทั้งหมด → กลับ Page_1
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("username")
        localStorage.removeItem("user_email")
        window.location.href = "http://localhost:5173"
      }
    }

    return Promise.reject(error)
  }
)

export default api
