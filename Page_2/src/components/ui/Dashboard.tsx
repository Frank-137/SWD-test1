import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Avatar, AvatarFallback } from "./avatar"
import { Badge } from "./badge"
import { Button } from "./button"
import { useEffect, useState } from "react"
import axios from "axios"

const CLIENT_ID_APP2 = "czcgWBuoNW42t4aGzLJdOoJe42ZftoCYw6z4bzlH"
const REDIRECT_URI_APP2 = "http://localhost:5174/callback"

// ฟังก์ชันช่วยสำหรับการทำ PKCE 
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
    let ignore = false

    async function initAuth() {
      // ดึง Access Token จาก Local Storage ของพอร์ต 5174 เอง
      const accessToken = localStorage.getItem("access_token")

      //  ถ้ามี Token อยู่แล้ว ลองเอาไปดึงข้อมูลผู้ใช้ดู
      if (accessToken) {
        try {
          const meRes = await axios.get("http://localhost:8000/users/me/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          if (!ignore) {
            setUser(meRes.data)
            return
          }
        } catch (err) {
          console.log("Token expired or invalid, need to refresh/re-auth")
          localStorage.removeItem("access_token")
        }
      }

      //  ถ้าไม่มี Token หรือ Token พัง ให้เริ่มกระบวนการ SSO PKCE ทันที
      try {
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        // จำ Verifier ไว้ใน sessionStorage 
        sessionStorage.setItem("code_verifier", codeVerifier)

        const params = new URLSearchParams({
          response_type: "code",
          client_id: CLIENT_ID_APP2, 
          redirect_uri: REDIRECT_URI_APP2, 
          scope: "read write",
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        })

        // เด้งไปที่หน้า Django OAuth
        window.location.href = `http://localhost:8000/o/authorize/?${params.toString()}`
      } catch (e) {
        console.error("Failed to initiate SSO", e)
      }
    }

    initAuth()

    return () => { ignore = true }
  }, [])

  if (!user) {
    return <p>Loading SSO Dashboard...</p>
  }

  // Logout 
  const handleLogout = () => {
    localStorage.removeItem("access_token")
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
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* ... ส่วนแสดงผลเนื้อหาเดิมของคุณ ... */}
        <Button variant="destructive" className="w-full mt-2" onClick={handleLogout}>
          Sign out from App 2
        </Button>
      </CardContent>
    </Card>
  )
}