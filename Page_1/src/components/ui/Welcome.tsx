import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export function Welcome() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")

  useEffect(() => {
    // ดึง Token ที่เก็บไว้ตอนผ่านหน้า Callback
    const token = localStorage.getItem("access_token")

    if (!token) {
      navigate("/")
      return
    }

    // ยิง API โดยแนบ Token ไปบอก Django ว่าเราคือใคร
    axios
      .get("http://localhost:8000/users/me/", {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      })
      .then((res) => {
        setUsername(res.data.username)
      })
      .catch(() => {
        // ถ้า Token หมดอายุ หรือพัง ให้เตะกลับไปหน้า Login
        localStorage.removeItem("access_token")
        navigate("/")
      })
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    navigate("/")
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Welcome, {username} 👋</CardTitle>
        <p className="text-sm text-muted-foreground">
          You logged in via SSO successfully.
        </p>
      </CardHeader>
      <CardContent>
        <Button className="w-full" variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </CardContent>
    </Card>
  )
}