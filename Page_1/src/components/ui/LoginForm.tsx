import { useAuth } from "../../hooks/useAuth"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export function LoginForm() {
  const { login } = useAuth()

  const handleSSOLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login() // ฟังก์ชันนี้จะทำ PKCE และเด้งไปที่หน้า Django อัตโนมัติ
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Welcome to My App</CardTitle>
        <p className="text-sm text-center text-muted-foreground">
          Sign in using your central account
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={handleSSOLogin} className="w-full">
          Login with Auth
        </Button>
      </CardContent>
    </Card>
  )
}