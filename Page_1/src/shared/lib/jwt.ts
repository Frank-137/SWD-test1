import { STORAGE_KEYS } from "./constants"

export interface UserProfile {
  name?: string
  preferred_username?: string
  username?: string
  email?: string
}

export function decodeJwt(token: string): UserProfile | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("0" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload) as UserProfile
  } catch {
    return null
  }
}

export function saveUserProfile(idToken: string): void {
  const profile = decodeJwt(idToken)
  if (!profile) return

  const username = profile.name || profile.preferred_username || profile.username || ""
  localStorage.setItem(STORAGE_KEYS.USERNAME, username)

  if (profile.email) {
    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, profile.email)
  }
}

export function clearUserStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USERNAME)
  localStorage.removeItem(STORAGE_KEYS.USER_EMAIL)
}