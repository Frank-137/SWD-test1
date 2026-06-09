import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

// กำหนดประเภทข้อมูล (Type) สำหรับช่องข้อมูลในฟอร์ม Login
type LoginFormFields = {
  username: string
  password: string
}

/**
 * Component: LoginForm
 * - หน้าฟอร์มล็อกอินสำหรับรับ Username และ Password จากผู้ใช้
 * - เรียกใช้ useAuth hook เพื่อพาเข้าสู่กระบวนการยืนยันตัวตน
 */
export function LoginForm() {
  // state สำหรับผูกค่าข้อมูลช่องกรอก (Input Fields)
  const [fields, setFields] = useState<LoginFormFields>({
    username: "",
    password: "",
  })
  
  // เรียกใช้ฟังก์ชัน login และดึง error จาก useAuth hook
  const { login, error } = useAuth()

  // ฟังก์ชัน handleChange สำหรับจับคู่ค่าข้อมูลที่มีการเปลี่ยนแปลงในแต่ละช่อง Input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.id]: e.target.value })
  }

  // ฟังก์ชัน handleSubmit ทำงานเมื่อผู้ใช้กด Submit ฟอร์มล็อกอิน
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // ส่งข้อมูล username/password ไปทำการล็อกอินและส่งต่อไปยังขั้นตอนตรวจสอบของ OAuth PKCE
    await login(fields.username, fields.password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-87.5">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
          {/* <p className="text-sm text-muted-foreground">Login with Username and Password.</p> */}
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit">Sign In</Button>
        </CardContent>
      </Card>
    </form>
  )
}
