import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginForm } from "./components/ui/LoginForm"
import { Callback } from "./components/ui/callback"
import { Welcome } from "./components/ui/Welcome"
import { useEffect } from "react"
import { useAuth } from "../src/hooks/useAuth"

// 2. สร้างคอมโพเนนต์พิเศษสำหรับหน้าแรกสุด (/) 
// ทำหน้าที่สะกิดให้ลูป OAuth เริ่มทำงานอัตโนมัติทันทีเมื่อเปิดแอป
function StartSSOFlow() {
  const { initiateSSO } = useAuth()

  useEffect(() => {
    initiateSSO() // ปั่น Code Challenge แล้วกระโดดไปพึ่งบารมี Django ทันทีในเสี้ยววินาที
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
        {/* 3. เพิ่ม Route สำหรับพาร์ทแรกสุดของเว็บ เข้ามาเชื่อมต่อระบบ */}
        <Route path="/" element={<StartSSOFlow />} />

        <Route
          path="/login"
          element={
            <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
              <LoginForm />
            </div>
          }
        />
        <Route
          path="/welcome"
          element={
            <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
              <Welcome />
            </div>
          }
        />
        <Route
          path="/callback"
          element={<Callback />}
        />

        {/* 4. ดักทางเผื่อผู้ใช้พิมพ์ URL มั่วซั่ว ให้เด้งกลับไปเริ่มลูปใหม่ที่หน้าแรกสุด */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}