import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

type LoginFormFields = Required<{
  username: string
  password: string
}>

export function LoginForm() {
  const [fields, setFields] = useState<LoginFormFields>({
    username: "",
    password: "",
  })
  const { login, error } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.id]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(fields.username, fields.password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
          {/* <p className="text-sm text-muted-foreground">Sign in to continue</p> */}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="frank"
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
              placeholder="••••••••"
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