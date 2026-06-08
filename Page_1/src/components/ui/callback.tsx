import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const CLIENT_ID_APP1 = "vFNeSjouVzhE7gpdTBsUOFjPayJfjjOdy2fgJsaO"
const REDIRECT_URI_APP1 = "http://localhost:5173/callback"
export function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function exchangeCode() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const codeVerifier = sessionStorage.getItem("code_verifier")

      if (!code || !codeVerifier) {
        navigate("/")
        return
      }

      try {
        const response = await axios.post(
          "http://localhost:8000/users/oauth/exchange/",
          {
            code,
            code_verifier: codeVerifier,
            client_id: CLIENT_ID_APP1,
            redirect_uri: REDIRECT_URI_APP1,
          },
          {
            withCredentials: true,
          }
        )

        const accessToken = response.data.access_token
        if (accessToken) {
          localStorage.setItem("access_token", accessToken)
        }

        sessionStorage.removeItem("code_verifier")
        navigate("/welcome")

      } catch (error) {
        console.error("Error exchanging code:", error)
        navigate("/")
      }
    }

    exchangeCode()
  }, [navigate])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-lg text-gray-500">Logging in to SSO...</p>
    </div>
  )
}