import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuth } from "@/features/auth/model/useAuth"
import { LoginPage } from "@/pages/login/ui/LoginPage"
import { WelcomePage } from "@/pages/welcome/ui/WelcomePage"
import { CallbackPage } from "@/pages/callback/ui/CallbackPage"

function StartSSOFlow() {
  const { initiateSSO } = useAuth()

  useEffect(() => {
    initiateSSO()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
      <p className="text-lg text-gray-500 animate-pulse">Connecting to SSO Gateway...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartSSOFlow />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
