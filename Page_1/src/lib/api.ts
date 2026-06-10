import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,       // ทุก request ติด cookie อัตโนมัติ
})

export default api