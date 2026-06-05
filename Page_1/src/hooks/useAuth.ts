import { useState } from "react"

const USERS = [
  { username: "Frank", password: "1234" },
  { username: "Pat", password: "1234" },
  { username: "swiftdynamics", password: "1234" },
  { username: "SWD", password: "1234" },
  { username: "Nat", password: "1234" },
  { username: "Kong", password: "1234" },
]

export function useAuth() {
  const [error, setError] = useState("")

  const login = (username: string, password: string) => {
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    )

    if (user) {
      window.location.href = `http://localhost:5174?username=${encodeURIComponent(username)}`
    } else {
      setError("Username or Password is incorrect")
    }
  }

  return { login, error }
}