import { useState } from "react"
import { apiClient } from "../lib/axiosInstance"
import { oauthConfig } from "../lib/oauthConfig"
import { generateCodeVerifier, generateCodeChallenge } from "../lib/pkce"

export type LoginResult = "success" | "error"

/**
 * Hook: useAuth
 * - ตรวจสอบ username/password กับ /users
 * - สร้าง PKCE code verifier/challenge
 * - redirect ไปยัง Page_2 authorize page
 */
export function useAuth() {
  const [error, setError] = useState("")

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      localStorage.setItem("pkce_code_verifier", codeVerifier)
      localStorage.setItem("username", username)

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

      const res = await apiClient.post("/oauth/authorize", payload)
      const authCode = res.data?.code

      if (!authCode) {
        setError("Authorization failed. No code returned.")
        return "error"
      }

      const callbackUrl = new URL(oauthConfig.redirectUri)
      callbackUrl.searchParams.set("code", authCode)
      callbackUrl.searchParams.set("state", username)

      window.location.href = callbackUrl.toString()
      return "success"
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Login Error:", err)
      return "error"
    }
  }

  return { login, error }
}
