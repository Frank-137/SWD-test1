import axios from "axios"

/**
 * สร้าง axios instance ที่ตั้งค่าไว้ล่วงหน้า
 * - Base URL: http://localhost:3000 (เซิร์ฟเวอร์ json-server)
 * - Timeout: 5000ms (รอ 5 วินาที แล้วถ้ายังไม่ได้ response จะยกเลิก)
 */
export const apiClient = axios.create({
  baseURL: "http://localhost:4000",
  timeout: 5000,
})

/**
 * ========== REQUEST INTERCEPTOR (ตัวกลางสำหรับการส่งคำขอ) ==========
 * 
 * ใช้ปรับปรุงคำขอ ก่อนส่งไปยังเซิร์ฟเวอร์
 * - เพิ่ม Authorization header (token) หากผู้ใช้ล็อกอินแล้ว
 * - เพิ่ม headers อื่น ๆ ตามต้องการ
 * - ตรวจสอบความถูกต้องของข้อมูลก่อนส่ง
 */
apiClient.interceptors.request.use(
  (config) => {
    // 1. เรียก localStorage เพื่อดึง token (ถ้ามี)
    const token = localStorage.getItem("authToken")

    // 2. ถ้ามี token ให้เพิ่มลง header ของคำขอ (Authorization: Bearer {token})
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 3. เพิ่ม header ให้ระบุว่าเป็นคำขอ JSON
    config.headers["Content-Type"] = "application/json"

    // 4. ตัวอย่างการ log (เลือกใช้ได้)
    console.log("📤 ส่งคำขอ:", config.method?.toUpperCase(), config.url)

    // 5. คืนค่า config ที่แก้ไขแล้ว
    return config
  },
  (error) => {
    // หากเกิดข้อผิดพลาดในการเตรียมคำขอ
    console.error("❌ ข้อผิดพลาดในการเตรียมคำขอ:", error)
    return Promise.reject(error)
  }
)

/**
 * ========== RESPONSE INTERCEPTOR (ตัวกลางสำหรับการรับตอบกลับ) ==========
 * 
 * ใช้จัดการตอบกลับจากเซิร์ฟเวอร์
 * - ตรวจสอบสถานะ HTTP (success / error)
 * - ทำการจัดการ error ต่างแบบแบบต่างกัน (401, 403, 500 เป็นต้น)
 * - ใส่ข้อมูลเพิ่มเติมหรือแปลงรูปแบบข้อมูลที่ได้รับ
 */
apiClient.interceptors.response.use(
  (response) => {
    // 1. ถ้าเซิร์ฟเวอร์ตอบกลับด้วยสถานะ 2xx (200-299 = สำเร็จ)
    console.log("✅ ได้รับตอบกลับ:", response.status, response.config.url)

    // 2. คืนค่า response object ปกติ
    return response
  },
  (error) => {
    // ถ้าเซิร์ฟเวอร์ตอบกลับด้วยสถานะ error หรือ network error

    // 1. ดึงข้อมูล response และสถานะ
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    // 2. จัดการแบบแยกตามสถานะต่างๆ
    if (status === 401) {
      // 401 = Unauthorized (ผู้ใช้ไม่ได้ล็อกอิน หรือ token หมดอายุ)
      console.error("🔐 ไม่ได้รับอนุญาต (401) - โปรดล็อกอินใหม่")
      localStorage.removeItem("authToken")
      localStorage.removeItem("username")
      // เรียก redirect ไปหน้า login (สามารถใช้ navigate ได้ที่ component)
    } else if (status === 403) {
      // 403 = Forbidden (ผู้ใช้ไม่มีสิทธิ์เข้าถึง)
      console.error("⛔ ห้ามเข้าถึง (403) - คุณไม่มีสิทธิ์")
    } else if (status === 404) {
      // 404 = Not Found (ไม่พบข้อมูล/หน้า)
      console.error("🔍 ไม่พบข้อมูล (404)")
    } else if (status === 500) {
      // 500 = Server Error (เซิร์ฟเวอร์มีปัญหา)
      console.error("💥 เซิร์ฟเวอร์เกิดข้อผิดพลาด (500)")
    } else if (!status) {
      // ไม่มีสถานะ = Network Error (ปัญหาการเชื่อมต่อ)
      console.error("📡 ปัญหาการเชื่อมต่อ:", message)
    } else {
      // Error อื่นๆ
      console.error(`❌ ข้อผิดพลาด (${status}):`, message)
    }

    // 3. คืนค่า Promise.reject เพื่อให้ component ที่เรียกสามารถจับได้
    return Promise.reject(error)
  }
)

export default apiClient
