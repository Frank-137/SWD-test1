export const oauthConfig = {
  authorizationEndpoint: "http://localhost:5174/authorize",
  tokenEndpoint: "http://localhost:5174/token",
  clientId: "front-end-client",
  redirectUri: `${window.location.origin}/auth/callback`,
  scope: "openid profile email",
  responseType: "code",
  codeChallengeMethod: "S256",
}
