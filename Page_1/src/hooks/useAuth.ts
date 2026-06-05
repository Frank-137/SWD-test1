import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export type LoginResult = "success" | "error"

export function useAuth() {
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const res = await axios.post("http://localhost:3000/api/login", {
        username,
        password,
      })

      if (res.data.success) {
        localStorage.setItem("username", res.data.username)
        navigate("/welcome")
        return "success"
      } else {
        setError("Username or Password is incorrect")
        return "error"
      }
    } catch (err) {
      setError("Username or Password is incorrect")
      return "error"
    }
  }

  return { login, error }
}