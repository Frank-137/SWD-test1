import { useState } from "react"
import api from "@/shared/api/axios"
import { generateCodeVerifier, generateCodeChallenge } from "@/shared/lib/pkce"
import { CLIENT_ID, REDIRECT_URI, API_BASE_URL, SESSION_KEYS, STORAGE_KEYS } from "@/shared/lib/constants"

export type LoginResult = "success" | "error"

export function useAuth() {
  const [error, setError] = useState<string | null>(null)

  const initiateSSO = async () => {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    sessionStorage.setItem(SESSION_KEYS.CODE_VERIFIER, codeVerifier)

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "openid profile read write",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    window.location.href = `${API_BASE_URL}/o/authorize/?${params.toString()}`
  }

  const login = async (username: string, passwordStr: string) => {
    setError(null)
    try {
      await api.post("/users/login/", { username, password: passwordStr })

      const urlParams = new URLSearchParams(window.location.search)
      const nextParam = urlParams.get("next")

      if (nextParam) {
        window.location.href = nextParam.startsWith("http")
          ? nextParam
          : `${API_BASE_URL}${nextParam}`
      } else {
        window.location.href = "http://localhost:5174"
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Username หรือ Password ไม่ถูกต้อง")
    }
  }

  return { initiateSSO, login, error }
}
