'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginTestPage() {
  const { signIn, user, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await signIn(email, password)
      toast.success('Login successful!')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully!')
    } catch (error: any) {
      toast.error('Logout failed')
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            Test login functionality for Dojah verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-100 rounded">
                <h3 className="font-bold text-green-800">✅ Logged In</h3>
                <p className="text-green-600">User: {user.email}</p>
                <p className="text-green-600">ID: {user.id}</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.href = '/dashboard/verification'}
                  className="w-full"
                >
                  Test Verification Page
                </Button>
                <Button 
                  onClick={() => window.location.href = '/verification-test'}
                  variant="outline"
                  className="w-full"
                >
                  Test Dojah Component
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="text-sm text-gray-600">
                <p>Test credentials:</p>
                <p>Email: test@example.com</p>
                <p>Password: password123</p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
