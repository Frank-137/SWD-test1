import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Avatar, AvatarFallback } from "./avatar"
import { Button } from "./button"
import { useEffect, useState } from "react"
import axios from "axios"

export function Dashboard() {
  const [user, setUser] = useState<any>(null)

  // State คุมสถานะการเปิดเปิดฟอร์ม และตัวแปรช่องกรอกอีเมล
  const [isEditing, setIsEditing] = useState(false)
  const [inputEmail, setInputEmail] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function initAuth() {
      const accessToken = localStorage.getItem("access_token")
      const storedUsername = localStorage.getItem("username")
      const storedEmail = localStorage.getItem("user_email")

      // ถ้าล็อกอินแล้วและมีข้อมูลในเครื่อง ยัดใส่ State วาดหน้าจอทันที 0 วินาที
      if (accessToken && storedUsername) {
        setUser({
          username: storedUsername,
          email: storedEmail || "no-email@gmail.com"
        })
        setInputEmail(storedEmail || "no-email@gmail.com")
        return
      }
    }
    initAuth()
  }, [])

  // ฟังก์ชันยิงข้ามพอร์ตไปขอแก้ไขอีเมลที่หลังบ้าน Django
  const handleSaveEmail = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.post(
        "http://localhost:8000/users/update-email/",
        { email: inputEmail },
        { headers: { Authorization: `Bearer ${token}` } } // แนบตั๋ว Access Token
      )

      if (response.data.status === "success") {
        localStorage.setItem("user_email", inputEmail)
        setUser((prev: any) => ({ ...prev, email: inputEmail }))
        setIsEditing(false)
        alert("แก้ไขอีเมลสำเร็จ! และหลังบ้านเซฟลงกล่อง Outbox เรียบร้อย")
      }
    } catch (error) {
      console.error("Failed to update email:", error)
      alert("เกิดข้อผิดพลาดในการแก้ไขอีเมล")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <p>Loading SSO Dashboard...</p>

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("username")
    localStorage.removeItem("user_email")
    window.location.href = "http://localhost:5173"
  }

  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-col items-center gap-3">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="text-2xl bg-[#f0ede8] text-[#5a5752]">
            {user.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <CardTitle>{user.username}</CardTitle>

          {/* สลับโหมดแสดงตัวหนังสือธรรมดา หรือช่อง Input บันทึกข้อมูล */}
          {!isEditing ? (
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-gray-400">{user.email}</p>
              <Button variant="outline" size="sm" className="mt-1 text-xs" onClick={() => setIsEditing(true)}>
                Edit Email
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-2 items-center">
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="border p-1 text-sm rounded bg-transparent text-center w-[250px]"
                placeholder="กรอกอีเมลใหม่"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEmail} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <Button variant="destructive" className="w-full mt-2" onClick={handleLogout}>
          Sign out from App 2
        </Button>
      </CardContent>
    </Card>
  )
}