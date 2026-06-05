export function Dashboard() {
  const params = new URLSearchParams(window.location.search)
  const username = params.get("username")

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">ยินดีต้อนรับ 👋</h1>
      <p className="text-gray-500">{username ?? "ไม่พบ username"}</p>
    </div>
  )
}