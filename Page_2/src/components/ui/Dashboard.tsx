import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Avatar, AvatarFallback } from "./avatar"
import { Badge } from "./badge"
import { Button } from "./button"

/**
 * Component: Dashboard
 * - หน้านี้เป็นหน้าปลายทางสำหรับสมาชิกที่ล็อกอินผ่านเรียบร้อยแล้ว
 * - จะทำการอ่านค่าจาก URL Parameters มาแสดงผลบนหน้าจอ และให้ผู้ใช้สิทธิ์สามารถ Sign Out ได้
 */
export function Dashboard() {
  // 1. ดึงพารามิเตอร์ต่าง ๆ ที่ส่งมาจาก Page 1 ผ่านทาง URL Query String
  const params = new URLSearchParams(window.location.search)
  const username = params.get("username")
  const accessToken = params.get("access_token")
  const state = params.get("state")

  return (
    <Card className="w-87.5">
      <CardHeader className="flex flex-col items-center gap-3">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="text-2xl bg-[#f0ede8] text-[#5a5752]">
            {username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <CardTitle>{username ?? "Username Not Found"}</CardTitle>
          <Badge variant="secondary">Member</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span>Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Access Token</span>
            <span className="break-all text-right">{accessToken ?? "Not provided"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">State</span>
            <span>{state ?? "-"}</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => window.location.href = "http://localhost:5173"}
        >
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}