import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export function Welcome() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")

  // ถ้าไม่มี username ให้กลับหน้า login
  useEffect(() => {
    if (!username) navigate("/")
  }, [username, navigate])

  const goToDashboard = () => {
    window.location.href = `http://localhost:5174?username=${encodeURIComponent(username!)}`
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Welcome, {username} 👋</CardTitle>
        <p className="text-sm text-muted-foreground">
          You have successfully signed in.
        </p>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={goToDashboard}>
          Go to Dashboard →
        </Button>
      </CardContent>
    </Card>
  )
}