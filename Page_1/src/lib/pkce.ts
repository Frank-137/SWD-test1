/**
 * PKCE helper functions
 * ใช้สำหรับสร้าง code verifier และ code challenge
 * ตามมาตรฐาน OAuth 2.0 PKCE
 */

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function generateRandomString(length: number) {
  const bytes = new Uint8Array(length)
  window.crypto.getRandomValues(bytes)

  return Array.from(bytes)
    .map((byte) => (byte % 36).toString(36))
    .join("")
}

export function generateCodeVerifier() {
  // code verifier ต้องมีความยาวระหว่าง 43-128 ตัวอักษร
  return generateRandomString(96)
}

export async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await window.crypto.subtle.digest("SHA-256", data)
  return base64UrlEncode(digest)
}
