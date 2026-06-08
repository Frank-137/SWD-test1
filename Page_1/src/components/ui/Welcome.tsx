import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export function Welcome() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")

  useEffect(() => {
    if (!username) {
      navigate("/")
      return
    }

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get("access_token")
    if (accessToken) {
      localStorage.setItem("access_token", accessToken)
      params.delete("access_token")
      params.delete("state")
      window.history.replaceState({}, "", `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`)
    }
  }, [username, navigate])

  const goToDashboard = () => {
    window.location.href = `http://localhost:5174?username=${encodeURIComponent(username!)}`
  }

  return (
    <Card className="w-87.5">
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
