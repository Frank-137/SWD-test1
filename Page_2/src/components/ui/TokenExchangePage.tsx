import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { generateAccessToken, sha256 } from "../../lib/pkce"

function getQueryParam(key: string) {
  return new URLSearchParams(window.location.search).get(key)
}

function loadStoredCodes() {
  try {
    return JSON.parse(localStorage.getItem("oauth_codes") || "{}")
  } catch {
    return {}
  }
}

function clearStoredCode(code: string) {
  const codes = loadStoredCodes()
  delete codes[code]
  localStorage.setItem("oauth_codes", JSON.stringify(codes))
}

export function TokenExchangePage() {
  const [message, setMessage] = useState("Exchanging authorization code for token...")

  useEffect(() => {
    let cancelled = false

    async function exchangeToken() {
      const code = getQueryParam("code")
      const codeVerifier = getQueryParam("code_verifier")
      const clientId = getQueryParam("client_id")
      const redirectUri = getQueryParam("redirect_uri")
      const state = getQueryParam("state")

      if (!code || !codeVerifier || !clientId || !redirectUri) {
        setMessage("Missing token exchange parameters.")
        return
      }

      const codes = loadStoredCodes()
      const stored = codes[code]
      if (!stored) {
        setMessage("Invalid or expired authorization code.")
        return
      }

      if (stored.client_id !== clientId) {
        setMessage("Client ID does not match.")
        return
      }

      if (Date.now() > stored.expires_at) {
        setMessage("Authorization code has expired.")
        clearStoredCode(code)
        return
      }

      const expectedChallenge = await sha256(codeVerifier)
      if (expectedChallenge !== stored.code_challenge) {
        setMessage("PKCE verification failed.")
        return
      }

      clearStoredCode(code)
      const accessToken = generateAccessToken()
      const redirect = new URL(redirectUri)
      redirect.searchParams.set("access_token", accessToken)
      redirect.searchParams.set("username", stored.username)
      if (state) redirect.searchParams.set("state", state)

      if (!cancelled) {
        window.location.href = redirect.toString()
      }
    }

    exchangeToken()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
      <Card className="w-87.5">
        <CardHeader>
          <CardTitle>Token Exchange</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}
