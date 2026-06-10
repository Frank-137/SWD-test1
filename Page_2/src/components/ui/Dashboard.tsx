import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Avatar, AvatarFallback } from "./avatar"
import { Button } from "./button"
import { useEffect, useState } from "react"
import axios from "axios"

export function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [inputEmail, setInputEmail] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function initAuth() {
      const accessToken = localStorage.getItem("access_token")
      const storedUsername = localStorage.getItem("username")
      const storedEmail = localStorage.getItem("user_email")

      // ถ้ามียูสเซอร์และตั๋วค้างในเครื่องอยู่แล้ว -> เปิดหน้าจอได้เลยทันที
      if (accessToken && storedUsername) {
        setUser({
          username: storedUsername,
          email: storedEmail || "no-email@gmail.com"
        })
        setInputEmail(storedEmail || "no-email@gmail.com")
        return
      }

      // 1. สร้าง code_verifier สำหรับ PKCE หยอดใส่ sessionStorage ของ App 2 ไว้รอเลย
      const generatedVerifier = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      sessionStorage.setItem("code_verifier", generatedVerifier);

      const clientId = "czcgWBuoNW42t4aGzLJdOoJe42ZftoCYw6z4bzlH"
      const redirectUri = "http://localhost:5174/callback"

      // 3. ดีดตัวพุ่งไปหาหลังบ้าน Django พอร์ต 8000 ทันที
      // (ตรงนี้ใช้ code_challenge_method=plain เพื่อให้ง่ายต่อการทดสอบ หรือถ้าคุณก้องมีฟังก์ชันแฮช SHA256 ก็ปรับเปลี่ยนได้ครับ)
      window.location.href = `http://localhost:8000/o/authorize/?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&code_challenge=${generatedVerifier}&code_challenge_method=plain`
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
        { headers: { Authorization: `Bearer ${token}` } }
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