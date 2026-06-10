import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import api from "@/lib/api"

const CLIENT_ID_APP1 = "czcgWBuoNW42t4aGzLJdOoJe42ZftoCYw6z4bzlH"
const REDIRECT_URI_APP1 = "http://localhost:5174/callback"

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
        const response = await api.post("/users/oauth/exchange/",
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

        // 1. ดึงของออกมาทั้งคู่ ทั้ง Access Token และ ID Token ของ OIDC
        const { access_token, id_token } = response.data

        if (access_token) {
          localStorage.setItem("access_token", access_token)
        }

        // 2. ลุยแกะกล่องสแกนบัตรประชาชนดิจิทัล ควักเอาคีย์ .name ตามที่เราพิสูจน์กันใน Console
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

            // บันทึกชื่อ "frank" ลงเครื่องฝั่งพอร์ต 5174 ทันที เพื่อส่งไม้ต่อให้หน้า Dashboard อ่านค่าได้
            localStorage.setItem("username", userProfile.name)
            if (userProfile.email) {
              localStorage.setItem("user_email", userProfile.email)
            }
          } catch (parseError) {
            console.error("OIDC JWT parsing failed in App 2:", parseError)
          }
        }

        sessionStorage.removeItem("code_verifier")

        // วาร์ปเข้าหน้าแดชบอร์ดด้วยความเร็วแสง
        navigate("/dashboard")

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