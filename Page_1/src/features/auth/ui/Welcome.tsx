import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/shared/api/axios"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { STORAGE_KEYS, CLIENT_ID } from "@/shared/lib/constants"

export function Welcome() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

    if (!token) {
      navigate("/")
      return
    }

    api.get("/users/me/")
      .then((res) => setUsername(res.data.username))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USERNAME)
        navigate("/")
      })
  }, [navigate])

  const handleLogout = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    try {
      await api.post("/users/logout/", { access_token: token, client_id: CLIENT_ID })
    } catch (error) {
      console.error("Error during backend logout:", error)
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USERNAME)
      navigate("/")
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Welcome, {username} 👋</CardTitle>
        <p className="text-sm text-muted-foreground">You logged in via APP! successfully.</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button className="w-full" onClick={() => window.open("http://localhost:5174", "_blank")}>
          Go to Page 2
        </Button>
      </CardContent>
      <CardContent>
        <Button className="w-full" variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </CardContent>
    </Card>
  )
}
