import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export type LoginResult = "success" | "error"

export function useAuth() {
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const res = await axios.get("http://localhost:3000/users")

      const user = res.data.find(
        (u: { username: string; password: string }) =>
          u.username === username && u.password === password
      )

      if (user) {
        localStorage.setItem("username", username)
        navigate("/welcome")
        return "success"
      } else {
        setError("Username หรือ Password ไม่ถูกต้อง")
        return "error"
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
      return "error"
    }
  }

  return { login, error }
}