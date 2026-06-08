import { AuthorizePage } from "./components/ui/AuthorizePage"
import { TokenExchangePage } from "./components/ui/TokenExchangePage"
import { Dashboard } from "./components/ui/Dashboard"

export default function App() {
  const path = window.location.pathname

  if (path === "/authorize") {
    return <AuthorizePage />
  }

  if (path === "/token") {
    return <TokenExchangePage />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
      <Dashboard />
    </div>
  )
}
