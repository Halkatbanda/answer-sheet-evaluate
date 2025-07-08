// app/login/page.js
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { useAuth } from "@/components/AuthProvider" // Import useAuth
import { LogIn } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
//   const { login } = useAuth(); // Get the login function from AuthContext

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password.")
      return
    }

    setLoading(true)
    // try {
    //   // Call your backend login API
    //   const response = await fetch("YOUR_ASP_NET_API_BASE_URL/api/Auth/login", { // <<< IMPORTANT: Update this URL
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ username, password }),
    //   })

    //   if (response.ok) {
        // const data = await response.json()
        // await login(data.token); // Use the login function from AuthContext to set token
        if (username=='sachin' && password=='12345') {
        router.push("/home") // Redirect to the protected HomePage
      } else {
        // const errorData = await response.json().catch(() => ({ message: "Login failed." }));
        alert(`Login failed:  || "Invalid credentials."`)
        setLoading(false)
      }
    // } catch (error) {
    //   console.error("Login error:", error)
    //   alert("An error occurred during login. Please try again.")
    // } finally {
    //   setLoading(false)
    // }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access the evaluation system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="w-full"
            size="lg"
          >
            {loading ? "Signing In..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}