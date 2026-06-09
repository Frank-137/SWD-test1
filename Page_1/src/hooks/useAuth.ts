import { useState } from "react"
import { apiClient } from "../lib/axiosInstance"
import { oauthConfig } from "../lib/oauthConfig"
import { generateCodeVerifier, generateCodeChallenge } from "../lib/pkce"

export type LoginResult = "success" | "error"

/**
 * Hook: useAuth
 * - ใช้สำหรับจัดการกระบวนการล็อกอินและเริ่มต้นขั้นตอนการอนุมัติสิทธิ์ (OAuth 2.0 PKCE)
 */
export function useAuth() {
  // state สำหรับเก็บข้อความข้อผิดพลาด (ถ้ามี)
  const [error, setError] = useState("")

  /**
   * ฟังก์ชัน login
   * - รับค่า username และ password
   * - สร้างคู่รหัสความปลอดภัย PKCE (code_verifier และ code_challenge)
   * - ส่งข้อมูลไปขอรับ Authorization Code จากเซิร์ฟเวอร์หลังบ้าน
   * - เมื่อสำเร็จ จะนำผู้ใช้ไปยังหน้า Callback ของตัวเอง
   */
  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      // 1. สุ่มรหัสลับความปลอดภัยต้นทาง (Code Verifier)
      const codeVerifier = generateCodeVerifier()
      // 2. เข้ารหัสลับเพื่อทำเป็นรหัสยืนยันปลายทาง (Code Challenge)
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      
      // 3. บันทึกข้อมูลรหัสลับและชื่อผู้ใช้ลงในเครื่องผู้ใช้ (localStorage) เพื่อเก็บไว้ตรวจสอบความถูกต้องทีหลัง
      localStorage.setItem("pkce_code_verifier", codeVerifier)
      localStorage.setItem("username", username)

      // 4. เตรียมข้อมูล (payload) ที่จะส่งไปหาหลังบ้านเพื่อขอรับสิทธิ์เข้าสู่ระบบ
      const payload = {
        username,
        password,
        client_id: oauthConfig.clientId,
        redirect_uri: oauthConfig.redirectUri,
        response_type: oauthConfig.responseType,
        scope: oauthConfig.scope,
        code_challenge: codeChallenge,
        code_challenge_method: oauthConfig.codeChallengeMethod,
        state: username,
      }

      // 5. ส่ง Request แบบ POST ไปยัง Endpoint /oauth/authorize ของหลังบ้าน
      const res = await apiClient.post("/oauth/authorize", payload)
      const authCode = res.data?.code

      // 6. ตรวจสอบว่าหลังบ้านส่ง Authorization Code กลับมาหรือไม่
      if (!authCode) {
        setError("Authorization failed. No code returned.")
        return "error"
      }

      // 7. กำหนด URL ปลายทาง (Callback URL) พร้อมกับแนบ code และ state
      const callbackUrl = new URL(oauthConfig.redirectUri)
      callbackUrl.searchParams.set("code", authCode)
      callbackUrl.searchParams.set("state", username)

      // 8. Redirect ผู้ใช้ไปยังหน้า Callback ทันที
      window.location.href = callbackUrl.toString()
      return "success"
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Login Error:", err)
      return "error"
    }
  }

  // ส่งค่า login function และ error message ออกไปใช้งานที่ Component
  return { login, error }
}
