import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { CLIENT_ID, REDIRECT_URI, TOKEN_URL, STORAGE_KEYS, SESSION_KEYS } from "@/shared/lib/constants"

export function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function exchangeCode() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const codeVerifier = sessionStorage.getItem(SESSION_KEYS.CODE_VERIFIER)

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
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
        }

        // ยิงตรงเข้าหาเส้น /o/token/ ของ Django OAuth Toolkit
        const response = await axios.post(
          TOKEN_URL,
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
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
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
            localStorage.setItem(STORAGE_KEYS.USERNAME, userProfile.name || userProfile.preferred_username)
            if (userProfile.email) {
              localStorage.setItem(STORAGE_KEYS.USER_EMAIL, userProfile.email)
            }

          } catch (parseError) {
            console.error("JWT parsing failed:", parseError)
          }
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        // ลบคีย์ถอนความจำ PKCE ออก และสั่งวาร์ปสลับแอป
        sessionStorage.removeItem(SESSION_KEYS.CODE_VERIFIER)
        window.location.href = "/welcome"

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
