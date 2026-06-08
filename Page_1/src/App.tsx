import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LoginForm } from "./components/ui/LoginForm"
import { AuthCallback } from "./components/ui/AuthCallback"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
              <LoginForm />
            </div>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
              <AuthCallback />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}