import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { generateRandomString } from "../../lib/pkce"

function getQueryParam(key: string) {
  return new URLSearchParams(window.location.search).get(key)
}

function loadStoredCodes() {
  try {
    return JSON.parse(localStorage.getItem("oauth_codes") || "{}")
  } catch {
    return {}
  }
}

function saveStoredCodes(codes: Record<string, any>) {
  localStorage.setItem("oauth_codes", JSON.stringify(codes))
}

export function AuthorizePage() {
  const clientId = getQueryParam("client_id")
  const redirectUri = getQueryParam("redirect_uri")
  const codeChallenge = getQueryParam("code_challenge")
  const codeChallengeMethod = getQueryParam("code_challenge_method")
  const state = getQueryParam("state")
  const username = getQueryParam("username")

  const hasRequiredParams = !!clientId && !!redirectUri && !!codeChallenge

  const handleAuthorize = () => {
    if (!hasRequiredParams) return

    const code = generateRandomString(48)
    const codes = loadStoredCodes()
    codes[code] = {
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      username: username || "unknown",
      created_at: Date.now(),
      expires_at: Date.now() + 5 * 60 * 1000,
    }
    saveStoredCodes(codes)

    const redirect = new URL(redirectUri)
    redirect.searchParams.set("code", code)
    if (state) redirect.searchParams.set("state", state)
    window.location.href = redirect.toString()
  }

  const handleDeny = () => {
    if (!redirectUri) return
    const redirect = new URL(redirectUri)
    redirect.searchParams.set("error", "access_denied")
    if (state) redirect.searchParams.set("state", state)
    window.location.href = redirect.toString()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
      <Card className="w-87.5">
        <CardHeader>
          <CardTitle>Authorize Request</CardTitle>
          <p className="text-sm text-muted-foreground">
            This page acts as the OAuth authorization server for Page_1.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {hasRequiredParams ? (
            <>
              <p className="text-sm text-muted-foreground">
                Client <strong>{clientId}</strong> requests permission for <strong>{username || "user"}</strong>.
              </p>
              <Button className="w-full" onClick={handleAuthorize}>
                Authorize
              </Button>
              <Button variant="outline" className="w-full" onClick={handleDeny}>
                Deny
              </Button>
            </>
          ) : (
            <p className="text-sm text-red-500">Missing required authorization parameters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
