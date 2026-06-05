import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginForm } from "./components/ui/LoginForm"
import { Welcome } from "./components/ui/Welcome"

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const username = localStorage.getItem("username")
  return username ? <>{children}</> : <Navigate to="/" />
}

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
          path="/welcome"
          element={
            <PrivateRoute>
              <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
                <Welcome />
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}