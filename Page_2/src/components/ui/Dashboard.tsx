export function Dashboard() {
  const params = new URLSearchParams(window.location.search)
  const username = params.get("username")

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">Hello:&nbsp;</h1>
      <p className="text-gray-500">{username ?? "Username Not Found"}</p>
    </div>
  )
}