import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export type LoginResult = "success" | "error"

const CLIENT_ID = "vFNeSjouVzhE7gpdTBsUOFjPayJfjjOdy2fgJsaO"
const REDIRECT_URI = "http://localhost:5173/callback"

function base64UrlEncode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

function generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

async function generateCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return base64UrlEncode(digest)
}

export function useAuth() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  // ⚡ ฟังก์ชันที่ 1: สำหรับกดปุ่ม "Login with SSO" หน้าแรกสุด (เพื่อเริ่มลูปดีดไป Django)
  const initiateSSO = async () => {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    sessionStorage.setItem("code_verifier", codeVerifier)

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "read write",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    window.location.href = `http://localhost:8000/o/authorize/?${params.toString()}`
  }

  //  สำหรับฟอร์มล็อกอิน (รับรหัสผ่าน ยิงเช็คคุกกี้เซสชันกล่าวง)
  const login = async (username: string, passwordStr: string) => {
    setError(null)
    try {
      // ยิงตรวจสอบรหัสผ่านที่ API หลังบ้านที่เราเตรียมไว้
      await axios.post(
        "http://localhost:8000/users/login/",
        { username, password: passwordStr },
        { withCredentials: true } // ยอมให้ Django ผูกคุกกี้เซสชันกลางติดมากับบราวเซอร์
      )

      // ตรวจพารามิเตอร์ "next" บน URL
      const urlParams = new URLSearchParams(window.location.search)
      const nextParam = urlParams.get("next")

      if (nextParam) {
        // ถ้ามาจากแอปอื่น  ให้ดีดกลับไปลูปออกตั๋วของ Django ทันที
        window.location.href = `http://localhost:8000${nextParam}`
      } else {
        // ถ้าล็อกอินเข้าแอปนี้โดยตรง ก็พาวิ่งเข้าหน้า Welcome
        navigate("/welcome")
      }
    } catch (err: any) {
      // ดึง Error จาก Django มาแสดงผลที่หน้าจอของเพื่อน
      setError(err.response?.data?.error || "Username หรือ Password ไม่ถูกต้อง")
    }
  }

  return { initiateSSO, login, error }
}