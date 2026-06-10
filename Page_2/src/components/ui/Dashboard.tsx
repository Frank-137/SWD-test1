import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Avatar, AvatarFallback } from "./avatar"
import { Badge } from "./badge"
import { Button } from "./button"
import { useEffect, useState } from "react"

const CLIENT_ID_APP2 = "czcgWBuoNW42t4aGzLJdOoJe42ZftoCYw6z4bzlH"
const REDIRECT_URI_APP2 = "http://localhost:5174/callback"

function generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

async function generateCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

export function Dashboard() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function initAuth() {
      // เช็ค localStorage ว่ามี access_token กับ username มั้ย ถ้ามี redirect เลย ถ้าไม้มี วนกลับ PKCE ใหม่
      const accessToken = localStorage.getItem("access_token")
      const storedUsername = localStorage.getItem("username")
      // ดึงอีเมลที่เซฟไว้จาก Local Storage
      const storedEmail = localStorage.getItem("user_email")

      // ถ้ามีของครบในเครื่องแล้ว จับม้วนรวมใส่ State แล้วเปิดหน้าจอทันที ไม่ต้องยิงคิวรี่
      if (accessToken && storedUsername) {
        setUser({
          username: storedUsername,
          email: storedEmail || "no-email@gmail.com" // แนบ email เข้าไปใน state user
        })
        return
      }

      try {
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        sessionStorage.setItem("code_verifier", codeVerifier)

        const params = new URLSearchParams({
          response_type: "code",
          client_id: CLIENT_ID_APP2,
          redirect_uri: REDIRECT_URI_APP2,
          scope: "openid profile email read write",
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        })

        // window.location.href = `http://localhost:8000/o/authorize/?${params.toString()}`
      } catch (e) {
        console.error("Failed to initiate SSO", e)
      }
    }

    initAuth()
  }, [])

  if (!user) {
    return <p>Loading SSO Dashboard...</p>
  }

  const handleLogout = () => {
    // ลบ access_token, username, email ทิ้งจาก localStorage แล้ว redirect ไป Page_1
    localStorage.removeItem("access_token")
    localStorage.removeItem("username")
    localStorage.removeItem("user_email") // ล้างเมลทิ้งตอน Logout ด้วย
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
          {/* บรรทัดนี้: พ่น Gmail โชว์ใต้ชื่อเท่ๆ สไตล์ OIDC โปรไฟล์ระดับสากล */}
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* ... ส่วนแสดงผลเนื้อหาเดิมของคุณ ... */}

        <Button variant="outline" className="w-full mt-2" onClick={handleLogout}>
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}