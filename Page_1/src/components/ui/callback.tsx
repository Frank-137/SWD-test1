import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios" 

const CLIENT_ID_APP1 = "vFNeSjouVzhE7gpdTBsUOFjPayJfjjOdy2fgJsaO"
const REDIRECT_URI_APP1 = "http://localhost:5173/callback"

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
        //เตรียมก้อนข้อมูลตามสเปกมาตรฐาน OAuth 2.0
        const payload = {
          grant_type: "authorization_code", 
          code: code,
          code_verifier: codeVerifier,
          client_id: CLIENT_ID_APP1,
          redirect_uri: REDIRECT_URI_APP1,
        }

        // ยิงตรงเข้าหาเส้น /o/token/ ของ Django OAuth Toolkit
        const response = await axios.post(
          "http://localhost:8000/o/token/",
          new URLSearchParams(payload), // แปลงก้อน Object ให้กลายเป็น x-www-form-urlencoded อัตโนมัติ
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            withCredentials: true, 
          }
        )

        const { access_token, id_token } = response.data

        if (access_token) {
          localStorage.setItem("access_token", access_token)
        }

        // ถอดรหัส ID Token 
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
            console.log("ID Token ตรวจสอบคีย์ข้างใน:", userProfile)

            // เก็บชื่อและอีเมล (ถ้ามีพ่นออกมาจากระบบ Claims หลังบ้าน)
            localStorage.setItem("username", userProfile.name || userProfile.preferred_username)
            if (userProfile.email) {
              localStorage.setItem("user_email", userProfile.email)
            }

          } catch (parseError) {
            console.error("JWT parsing failed:", parseError)
          }
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        // ลบคีย์ถอนความจำ PKCE ออก และสั่งวาร์ปสลับแอป
        sessionStorage.removeItem("code_verifier")
        window.location.href = "http://localhost:5173/welcome" // ดีดไปหาหน้า Dashboard ของ App 2

      } catch (error: any) {
        console.error("Error exchanging code:", error.response?.data || error.message)
        navigate("/")
      }
    }

    exchangeCode()
  }, [navigate])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-lg text-gray-500">Logging in...</p>
    </div>
  )
}