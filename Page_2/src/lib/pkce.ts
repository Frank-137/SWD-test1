function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export function generateRandomString(length = 64) {
  const bytes = new Uint8Array(length)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((byte) => (byte % 36).toString(36))
    .join("")
}

export async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await window.crypto.subtle.digest("SHA-256", data)
  return base64UrlEncode(digest)
}

export async function sha256(value: string) {
  const encoder = new TextEncoder()
  const hash = await window.crypto.subtle.digest("SHA-256", encoder.encode(value))
  return base64UrlEncode(hash)
}

export function generateAccessToken() {
  const bytes = new Uint8Array(32)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}
