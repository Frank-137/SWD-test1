import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Avatar, AvatarFallback } from "./avatar"
import { Button } from "./button"
import { useEffect, useState } from "react"
import axios from "axios"

const CLIENT_ID_APP2 = "czcgWBuoNW42t4aGzLJdOoJe42ZftoCYw6z4bzlH"
const REDIRECT_URI_APP2 = "http://localhost:5174/callback"

function generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)

  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

async function generateCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest("SHA-256", data)

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

export function Dashboard() {
  const [user, setUser] = useState<any>(null)

  // เปิด/ปิดโหมดแก้ไขอีเมล
  const [isEditing, setIsEditing] = useState(false)

  // เก็บค่าอีเมลที่ผู้ใช้กำลังพิมพ์
  const [inputEmail, setInputEmail] = useState("")

  // ใช้เช็คสถานะตอนกด Save
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function initAuth() {
      // เช็ค localStorage ว่ามี access_token กับ username มั้ย ถ้ามี redirect เลย ถ้าไม่มี วนกลับ PKCE ใหม่
      const accessToken = localStorage.getItem("access_token")
      const storedUsername = localStorage.getItem("username")

      // ดึงอีเมลที่เซฟไว้จาก Local Storage
      const storedEmail = localStorage.getItem("user_email")

      // ถ้ามีของครบในเครื่องแล้ว จับม้วนรวมใส่ State แล้วเปิดหน้าจอทันที ไม่ต้องยิงคิวรี่
      if (accessToken && storedUsername) {
        const email = storedEmail || "no-email@gmail.com"

        setUser({
          username: storedUsername,
          email: email,
        })

        // เอาอีเมลเดิมไปใส่ใน input ไว้ก่อน เผื่อผู้ใช้กด Edit Email
        setInputEmail(email)
        return
      }

      try {
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        // แอบเก็บ code_verifier ไว้ใน sessionStorage เพื่อใช้ตอนหน้า callback เอา code ไปแลก token
        sessionStorage.setItem("code_verifier", codeVerifier)

        const params = new URLSearchParams({
          response_type: "code",
          client_id: CLIENT_ID_APP2,
          redirect_uri: REDIRECT_URI_APP2,
          scope: "openid profile email read write",
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        })

        // ดีดตัวไปหา OAuth Server ของ Django เพื่อขอ Authorization Code
        window.location.href = `http://localhost:8000/o/authorize/?${params.toString()}`
      } catch (e) {
        console.error("Failed to initiate SSO", e)
      }
    }

    initAuth()
  }, [])

  // ฟังก์ชันยิงข้ามพอร์ตไปขอแก้ไขอีเมลที่หลังบ้าน Django
  const handleSaveEmail = async () => {
    const token = localStorage.getItem("access_token")

    // ถ้าไม่มี access_token แปลว่ายังไม่ได้ login หรือ token หาย
    if (!token) return

    setLoading(true)

    try {
      const response = await axios.post(
        "http://localhost:8000/users/update-email/",
        {
          email: inputEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.status === "success") {
        // อัปเดตอีเมลใน localStorage ให้ตรงกับข้อมูลใหม่
        localStorage.setItem("user_email", inputEmail)

        // อัปเดต state เพื่อให้หน้าเว็บเปลี่ยนทันทีโดยไม่ต้อง refresh
        setUser((prev: any) => ({
          ...prev,
          email: inputEmail,
        }))

        // ปิดโหมดแก้ไข
        setIsEditing(false)

        alert("แก้ไขอีเมลสำเร็จ!")
      }
    } catch (error) {
      console.error("Failed to update email:", error)
      alert("เกิดข้อผิดพลาดในการแก้ไขอีเมล")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <p>Loading SSO Dashboard...</p>
  }
  const handleLogout = async () => {
    const token = localStorage.getItem("access_token")

    try {
      await axios.post(
        "http://localhost:8000/users/logout/",
        {
          access_token: token,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      )
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("username")
      localStorage.removeItem("user_email")

      window.location.href = "http://localhost:5173"
    }
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

          {/* Gmail โชว์ */}
          {!isEditing ? (
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-gray-400">{user.email}</p>

              {/* ปุ่มเปิดโหมดแก้ไขอีเมล */}
              <Button
                variant="outline"
                size="sm"
                className="mt-1 text-xs"
                onClick={() => setIsEditing(true)}
              >
                Edit Email
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-2 items-center">
              {/* ช่องกรอกอีเมลใหม่ */}
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="border p-1 text-sm rounded bg-transparent text-center w-[250px]"
                placeholder="กรอกอีเมลใหม่"
              />

              <div className="flex gap-2">
                {/* ยิง API ไปแก้ไขอีเมลที่ Django */}
                <Button
                  size="sm"
                  onClick={handleSaveEmail}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>

                {/* ยกเลิกการแก้ไขและกลับไปดูข้อมูลเดิม */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setInputEmail(user.email)
                    setIsEditing(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* ปุ่ม logout ออกจาก App 2 แล้วกลับไปหน้า App 1 */}
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}