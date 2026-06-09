import { useEffect, useState } from "react"
import { apiClient } from "../../lib/axiosInstance"
import { oauthConfig } from "../../lib/oauthConfig"

/**
 * Component: AuthCallback
 * - ทำหน้าที่เป็นหน้าทางผ่าน (Callback) เมื่อระบบได้รหัสยืนยันตัวตนมาแล้ว
 * - จะทำการส่งข้อมูลไปขอรับ Access Token จากหลังบ้าน และเปลี่ยนหน้าไปยัง Page_2 (Dashboard)
 */
export function AuthCallback() {
  // state สำหรับเก็บข้อความแสดงสถานะความคืบหน้าของขั้นตอน
  const [message, setMessage] = useState("Exchanging authorization code for token...")

  useEffect(() => {
    let isCancelled = false // ตัวแปรสำหรับป้องกันการเรียกซ้ำเมื่อ Component ถูก unmount

    // ฟังก์ชันย่อยสำหรับขอแลกเปลี่ยน token
    async function exchangeToken() {
      // 1. ดึงค่า code และ state ที่ถูกแนบมากับ URL
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const state = params.get("state")
      
      // 2. ดึงค่า code_verifier ดั้งเดิม และ username ที่เก็บอยู่ในเครื่อง (localStorage)
      const codeVerifier = localStorage.getItem("pkce_code_verifier")
      const username = localStorage.getItem("username")

      // 3. ตรวจสอบเบื้องต้นว่ามีข้อมูลครบหรือไม่
      if (!code || !codeVerifier) {
        setMessage("Authorization code or PKCE verifier not found.")
        return
      }

      try {
        // 4. ส่ง Request POST เพื่อนำ Code และ Verifier ไปแลกรับ Access Token จริงจากหลังบ้าน
        const res = await apiClient.post("/oauth/token", {
          grant_type: "authorization_code",
          code,
          redirect_uri: oauthConfig.redirectUri,
          client_id: oauthConfig.clientId,
          code_verifier: codeVerifier,
        })

        const accessToken = res.data?.access_token
        const returnedUsername = res.data?.username || username

        // 5. ตรวจสอบว่าหลังบ้านส่ง Access Token กลับมาหรือไม่
        if (!accessToken) {
          setMessage("Token exchange failed. No access token returned.")
          return
        }

        // 6. จัดเก็บ Access Token และข้อมูลผู้ใช้ลงใน localStorage ในเครื่อง
        localStorage.setItem("access_token", accessToken)
        if (returnedUsername) {
          localStorage.setItem("username", returnedUsername)
        }

        // 7. กำหนด URL เพื่อทำการ Redirect ผู้ใช้ข้ามไปยัง Page_2 (พอร์ต 5174)
        const redirect = new URL(oauthConfig.resultEndpoint)
        redirect.searchParams.set("access_token", accessToken)
        if (returnedUsername) redirect.searchParams.set("username", returnedUsername)
        if (state) redirect.searchParams.set("state", state)

        // 8. ล้างข้อมูลชั่วคราวทั้งหมดออกจาก localStorage ก่อน Redirect
        localStorage.removeItem("pkce_code_verifier")
        localStorage.removeItem("username")
        localStorage.removeItem("access_token")

        // 9. ทำการ Redirect ข้ามพอร์ตไปยัง Page_2
        if (!isCancelled) {
          window.location.href = redirect.toString()
        }
      } catch (error) {
        console.error(error)
        setMessage("Token exchange failed. Please try again.")
      }
    }

    exchangeToken()

    // cleanup function เมื่อ Component ถูกยกเลิก
    return () => {
      isCancelled = true
    }
  }, [])

  // แสดงผลสถานะข้อความบนหน้าจอระหว่างรอโหลด
  return <div className="min-h-screen flex items-center justify-center">{message}</div>
}
