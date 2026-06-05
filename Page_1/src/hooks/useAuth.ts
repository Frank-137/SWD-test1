import { useState } from "react"

export function useAuth() {
  const [error, setError] = useState("")

  const login = (username: string, password: string) => {
    if (username === "swiftdynamics" && password === "1234") {
      window.location.href = `http://localhost:5174?username=${encodeURIComponent(username)}`
    } else {
      setError("Username or Password is incorrect")
    }
  }

  return { login, error }
}