export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID
export const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const TOKEN_URL = import.meta.env.VITE_TOKEN_URL
export const APP1_URL = import.meta.env.VITE_APP1_URL
export const APP2_URL = import.meta.env.VITE_APP2_URL

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  USERNAME: "username",
  USER_EMAIL: "user_email",
} as const

export const SESSION_KEYS = {
  CODE_VERIFIER: "code_verifier",
} as const
