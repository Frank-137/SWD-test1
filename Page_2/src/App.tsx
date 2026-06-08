import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Dashboard } from "./components/ui/Dashboard"
import { Callback } from "./components/ui/callback" //

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
      <BrowserRouter>
        <Routes>
          {/* 1. ถ้าเปิดมาหน้าแรกสุด (/) ให้เตะไปที่หน้า /dashboard เพื่อเช็คสิทธิ์ล็อกอิน */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 2. หน้าหลักสำหรับแสดงผลข้อมูลแดชบอร์ด */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 3. หน้าพิเศษสำหรับรองรับตั๋วออโต้จาก Django (หัวใจสำคัญที่จะเคลียร์ลูปนรก) */}
          <Route path="/callback" element={<Callback />} />
          
          {/* เผื่อผู้ใช้พิมพ์ URL มั่วซั่ว ให้เด้งกลับไปเริ่มต้นใหม่ */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}