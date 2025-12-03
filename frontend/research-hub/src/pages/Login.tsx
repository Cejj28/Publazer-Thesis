import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { loginUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import logoImage from '../assets/ustp.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      login(response.user);

      toast.success(`Welcome back, ${response.user.name}!`, {
        description: `Logged in as ${response.user.role}`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.error || 'Invalid credentials. Please try again.';
      toast.error('Login Failed', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <img
              src={logoImage}  
              alt="PUBLAZER Logo"
              className="w-20 h-20 object-contain drop-shadow-lg"
            />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">PUBLAZER</h1>
          <p className="text-muted-foreground mt-1 text-base">
            Academic Repository & Plagiarism Detection System
          </p>
        </div>

        {/* ====== LOGIN CARD ====== */}
        <Card className="shadow-2xl border">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl font-semibold">Login</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleManualLogin} className="space-y-5">

              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full py-5 text-base" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Don’t have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
