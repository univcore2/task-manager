
    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Eye, EyeOff, LogIn } from 'lucide-react';

    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const navigate = useNavigate();
      const { login } = useAuth();
      const { toast } = useToast();
      const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/78f2817e-7b4a-4cfc-b926-b6c595976b7a/25674fd3dadb095ddfb23eafa0adacf6.png";

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          await login(email, password);
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          navigate('/dashboard');
        } catch (error) {
          toast({
            title: "Login Failed",
            description: error.message || "Please check your credentials and try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="text-center">
                <img src={logoUrl} alt="Marundeshwara Enterprises Logo" className="w-48 mx-auto mb-4" />
                <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
                <CardDescription>Sign in to access your dashboard.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com or user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="adminpass or userpass"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="text-base"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <LogIn className="mr-2 h-5 w-5" />
                    )}
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-center text-sm text-muted-foreground">
                <p>Use admin@example.com / adminpass for Admin</p>
                <p>Use user@example.com / userpass for User</p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default LoginPage;
  