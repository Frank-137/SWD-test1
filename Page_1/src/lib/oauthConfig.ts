export const oauthConfig = {
  authorizationEndpoint: "http://localhost:4000/oauth/authorize",
  tokenEndpoint: "http://localhost:4000/oauth/token",
  resultEndpoint: "http://localhost:5174/",
  clientId: "front-end-client",
  redirectUri: `${window.location.origin}/auth/callback`,
  scope: "openid profile email",
  responseType: "code",
  codeChallengeMethod: "S256",
}
