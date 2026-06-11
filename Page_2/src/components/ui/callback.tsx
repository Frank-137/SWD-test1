import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios" // 🚀 แนะนำใช้ axios ตัวหลักเพื่อคุมคอนเทนต์ x-www-form-urlencoded ได้เนียนๆ

const CLIENT_ID_APP2 = "czcgWBuoNW42t4aGzLJdOoJe42ZftoCYw6z4bzlH" // ตรวจสอบ ID ของ App 2 ใน Django Admin อีกครั้งนะครับ
const REDIRECT_URI_APP2 = "http://localhost:5174/callback"

export function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function exchangeCode() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const codeVerifier = sessionStorage.getItem("code_verifier")

      if (!code || !codeVerifier) {
        navigate("/")
        return
      }

      try {
        const payload = {
          grant_type: "authorization_code", 
          code: code,
          code_verifier: codeVerifier,
          client_id: CLIENT_ID_APP2,
          redirect_uri: REDIRECT_URI_APP2,
        }
        const response = await axios.post(
          "http://localhost:8000/o/token/",
          new URLSearchParams(payload), 
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            withCredentials: true, 
          }
        )

        // ดึงของออกมา ทั้ง Access Token และ ID Token ของ OIDC
        const { access_token, id_token } = response.data

        if (access_token) {
          localStorage.setItem("access_token", access_token)
        }

        // แกะกล่อง ID Token คลี่ดูข้อมูลส่วนตัวผู้ใช้ (ท่อนเดิมของคุณก้อง ดีมากอยู่แล้ว)
        if (id_token) {
          try {
            const base64Url = id_token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
              window.atob(base64)
                .split('')
                .map((c) => '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            )
            const userProfile = JSON.parse(jsonPayload)
            console.log("📝 [Debug] แกะไส้ใน ID Token แดชบอร์ดสำเร็จ:", userProfile)

            // คีย์มาตรฐานใน ID Token มักจะเป็น .name หรือ .preferred_username
            const finalUsername = userProfile.name || userProfile.preferred_username || userProfile.username

            localStorage.setItem("username", finalUsername)
            if (userProfile.email) {
              localStorage.setItem("user_email", userProfile.email)
            }
          } catch (parseError) {
            console.error("OIDC JWT parsing failed in App 2:", parseError)
          }
        }

        // ✨ 3. เคลียร์คีย์ ?code= บน URL ทิ้งด่วน! เพื่อตัดวงจรรัวยิง Infinite Loop
        window.history.replaceState({}, document.title, window.location.pathname)

        // ลบกล่องจำตัวยืนยันรหัสผ่าน PKCE
        sessionStorage.removeItem("code_verifier")

        // 🚀 4. วาร์ปส่งตัวกลับเข้าสู่หน้า Dashboard หลักอย่างสวยงาม
        navigate("/dashboard")

      } catch (error: any) {
        console.error("❌ Error exchanging code:", error.response?.data || error.message)
        navigate("/")
      }
    }

    exchangeCode()
  }, [navigate])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-lg text-gray-500">Logging in to SSO...</p>
    </div>
  )
}