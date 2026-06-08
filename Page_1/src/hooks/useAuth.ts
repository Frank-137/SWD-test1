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
      const res = await apiClient.get("/users")
      const user = res.data.find(
        (u: { username: string; password: string }) =>
          u.username === username && u.password === password
      )

      if (!user) {
        setError("Username or Password is incorrect")
        return "error"
      }

      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      localStorage.setItem("pkce_code_verifier", codeVerifier)
      localStorage.setItem("username", username)

      const authUrl = new URL(oauthConfig.authorizationEndpoint)
      authUrl.searchParams.set("response_type", oauthConfig.responseType)
      authUrl.searchParams.set("client_id", oauthConfig.clientId)
      authUrl.searchParams.set("redirect_uri", oauthConfig.redirectUri)
      authUrl.searchParams.set("scope", oauthConfig.scope)
      authUrl.searchParams.set("code_challenge", codeChallenge)
      authUrl.searchParams.set("code_challenge_method", oauthConfig.codeChallengeMethod)
      authUrl.searchParams.set("state", username)
      authUrl.searchParams.set("username", username)

      window.location.href = authUrl.toString()
      return "success"
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Login Error:", err)
      return "error"
    }
  }

  return { login, error }
}
