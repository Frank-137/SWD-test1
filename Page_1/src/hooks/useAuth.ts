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
  const login = async () => {
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

    window.location.href =
      `http://localhost:8000/o/authorize/?${params.toString()}`
  }

  return { login }
}