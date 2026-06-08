import { useEffect, useState } from "react"
import { oauthConfig } from "../../lib/oauthConfig"

export function AuthCallback() {
  const [message, setMessage] = useState("Processing authorization code...")

  useEffect(() => {
    let isCancelled = false

    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const state = params.get("state")
    const codeVerifier = localStorage.getItem("pkce_code_verifier")

    if (!code || !codeVerifier) {
      setMessage("Authorization Code or Code Verifier not found.")
      return
    }

    const tokenUrl = new URL(oauthConfig.tokenEndpoint)
    tokenUrl.searchParams.set("code", code)
    tokenUrl.searchParams.set("code_verifier", codeVerifier)
    tokenUrl.searchParams.set("client_id", oauthConfig.clientId)
    tokenUrl.searchParams.set("redirect_uri", `${new URL(oauthConfig.tokenEndpoint).origin}/`)
    if (state) tokenUrl.searchParams.set("state", state)

    if (!isCancelled) {
      window.location.href = tokenUrl.toString()
    }

    return () => {
      isCancelled = true
    }
  }, [])

  return <div className="min-h-screen flex items-center justify-center">{message}</div>
}
