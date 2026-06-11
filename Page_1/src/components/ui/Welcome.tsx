import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export function Welcome() {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("access_token")

        if (!token) {
            navigate("/")
            return
        }

        api.get("/users/me/")
            .then((res) => {
                setUsername(res.data.username)
            })
            .catch(() => {
                // บล็อกนี้จะทำงานก็ต่อเมื่อ "ทั้ง Access และ Refresh Token พังคู่" เท่านั้น
                localStorage.removeItem("access_token")
                localStorage.removeItem("username")
                navigate("/")
            })
    }, [navigate])

    const handleLogout = async () => {
        const token = localStorage.getItem("access_token")

        try {
            await api.post("/users/logout/", {
                access_token: token,
            })
        } catch (error) {
            console.error("Error during backend logout:", error)
        } finally {
            localStorage.removeItem("access_token")
            // localStorage.removeItem("refresh_token") 
            localStorage.removeItem("username")

            // เตะผู้ใช้กลับไปหน้าแรกสุด
            navigate("/")
        }
    }

    const handleGoToPage2 = () => {
        window.open("http://localhost:5174", "_blank")
    }

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Welcome, {username} 👋</CardTitle>
                <p className="text-sm text-muted-foreground">
                    You logged in via SSO successfully.
                </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <Button className="w-full" onClick={handleGoToPage2}>
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