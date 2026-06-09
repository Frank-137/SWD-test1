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
        const response = await axios.post(
          "http://localhost:8000/users/oauth/exchange/",
          {
            code,
            code_verifier: codeVerifier,
            client_id: CLIENT_ID_APP1,
            redirect_uri: REDIRECT_URI_APP1,
          },
          {
            withCredentials: true,
          }
        )

        const { access_token, id_token } = response.data
        if (access_token) {
          localStorage.setItem("access_token", access_token)
        }
        if (id_token) {
          try {
            // JWT มี 3 ท่อนคั่นด้วยจุด [Header].[Payload].[Signature]เราจะตัดเอาท่อน 2 (Payload) มาใช้งาน
            const base64Url = id_token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

            // แปลง Base64 กลับมาเป็นสตริง JSON (รองรับภาษาไทยและอักขระพิเศษ)
            const jsonPayload = decodeURIComponent(
              window.atob(base64)
                .split('')
                .map((c) => '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            )

            // แปลงสตริงให้กลายเป็น Object ของ JavaScript
            const userProfile = JSON.parse(jsonPayload)

            //ดึงคีย์ "username" ที่เราเขียนสั่งยัดไว้ใน oauth_validators.py หลังบ้านมาเซฟลงเครื่อง!
            console.log("ID Token ตรวจสอบคีย์ข้างใน:", userProfile)
            localStorage.setItem("username", userProfile.name)

          } catch (parseError) {
            console.error("JWT parsing failed, using fallback:", parseError)
          }
        }

        // ล้างค่า code_verifier ทิ้งตามปกติ
        sessionStorage.removeItem("code_verifier")
        navigate("/welcome")
      } catch (error) {
        console.error("Error exchanging code:", error)
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