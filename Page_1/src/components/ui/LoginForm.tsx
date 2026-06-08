import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import axios from "axios"

type LoginFormFields = Required<{
  username: string
  password: string
}>

export function LoginForm() {
  const navigate = useNavigate()
  const [fields, setFields] = useState<LoginFormFields>({
    username: "",
    password: "",
  })
  const [authError, setAuthError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.id]: e.target.value })
  }

  // ฟังก์ชัน Submit ให้เดินตามสเต็ป SSO Custom Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    try {
      // ยิงไปตรวจรหัสผ่านที่ API ตัวใหม่ที่เราสร้างไว้ใน Django 
      await axios.post(
        "http://localhost:8000/users/login/",
        {
          username: fields.username,
          password: fields.password,
        },
        {
          withCredentials: true
        }
      )

      //  แอบส่องดูบน URL ของเบราว์เซอร์ว่ามีตัวแปร ?next=... ฝากมาไหม
      const urlParams = new URLSearchParams(window.location.search)
      const nextParam = urlParams.get("next")

      if (nextParam) {
        // เช็คว่าถ้า nextParam มี http นำหน้ามาอยู่แล้ว ให้สั่งวิ่งไปค่านั้นตรงๆ เลย
        if (nextParam.startsWith("http")) {
          window.location.href = nextParam
        } else {
          // เผื่อบางกรณี Django ส่งมาเป็นพาร์ทสั้น เช่น /o/authorize/... ค่อยแปะ domain เพิ่ม
          window.location.href = `http://localhost:8000${nextParam}`
        }
      } else {
        // ถ้าไม่มี next แปลว่าเข้า App 1 ตรงๆ
        navigate("/welcome")
      }

    } catch (err: any) {
      // ถ้าหลังบ้านตอบ 400 หรือรหัสผ่านผิด ให้เอาข้อความเออเร่อมาโชว์บนหน้าจอ
      setAuthError(err.response?.data?.error || "เกิดข้อผิดพลาดในการเชื่อมต่อระบบล็อกอิน")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Input your username"
              value={fields.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Input your password"
              value={fields.password}
              onChange={handleChange}
              required
            />
          </div>
          {/* แสดงผล Error ของ SSO */}
          {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
          <Button type="submit" className="w-full">Sign In</Button>
        </CardContent>
      </Card>
    </form>
  )
}