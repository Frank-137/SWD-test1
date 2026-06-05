import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Avatar, AvatarFallback } from "./avatar"
import { Badge } from "./badge"
import { Button } from "./button"

export function Dashboard() {
  const params = new URLSearchParams(window.location.search)
  const username = params.get("username")

  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-col items-center gap-3">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="text-2xl bg-[#f0ede8] text-[#5a5752]">
            {username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <CardTitle>{username ?? "ไม่พบ username"}</CardTitle>
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
            <span className="text-muted-foreground">Role</span>
            <span>Member</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session</span>
            <span>Active</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => window.location.href = "http://localhost:5173"}
        >
          Sign out
        </Button>
      </CardContent>
    </Card>
  )
}