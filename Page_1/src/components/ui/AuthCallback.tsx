import { useEffect, useState } from "react"
import { apiClient } from "../../lib/axiosInstance"
import { oauthConfig } from "../../lib/oauthConfig"

export function AuthCallback() {
  const [message, setMessage] = useState("Exchanging authorization code for token...")

  useEffect(() => {
    let isCancelled = false

    async function exchangeToken() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const state = params.get("state")
      const codeVerifier = localStorage.getItem("pkce_code_verifier")
      const username = localStorage.getItem("username")

      if (!code || !codeVerifier) {
        setMessage("Authorization code or PKCE verifier not found.")
        return
      }

      try {
        const res = await apiClient.post("/oauth/token", {
          grant_type: "authorization_code",
          code,
          redirect_uri: oauthConfig.redirectUri,
          client_id: oauthConfig.clientId,
          code_verifier: codeVerifier,
        })

        const accessToken = res.data?.access_token
        const returnedUsername = res.data?.username || username

        if (!accessToken) {
          setMessage("Token exchange failed. No access token returned.")
          return
        }

        localStorage.setItem("access_token", accessToken)
        if (returnedUsername) {
          localStorage.setItem("username", returnedUsername)
        }

        const redirect = new URL(oauthConfig.resultEndpoint)
        redirect.searchParams.set("access_token", accessToken)
        if (returnedUsername) redirect.searchParams.set("username", returnedUsername)
        if (state) redirect.searchParams.set("state", state)

        if (!isCancelled) {
          window.location.href = redirect.toString()
        }
      } catch (error) {
        console.error(error)
        setMessage("Token exchange failed. Please try again.")
      }
    }

    exchangeToken()

    return () => {
      isCancelled = true
    }
  }, [])

  return <div className="min-h-screen flex items-center justify-center">{message}</div>
}
