import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export function Welcome() {
  const username = localStorage.getItem("username")

  const handleGoToPage2 = () => {
    window.open("http://localhost:5174", "_blank")
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Welcome, {username} 👋</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button className="w-full" onClick={handleGoToPage2}>
          Go to Page 2
        </Button>
      </CardContent>
    </Card>
  )
}
