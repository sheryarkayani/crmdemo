import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { LoginFormData } from '@/types/auth';

const LoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(formData.email, formData.password);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className={`relative z-10 w-full max-w-lg transition-all duration-1000 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Enhanced Logo and Branding */}
        <div className="text-center mb-12">
          <div className={`w-24 h-24 gradient-apple-blue rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform transition-all duration-700 ease-out ${mounted ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`} style={{ animationDelay: '300ms' }}>
            <div className="relative">
              <span className="text-4xl font-bold text-white filter drop-shadow-lg">M</span>
              <div className="absolute inset-0 w-24 h-24 rounded-3xl bg-white/20 animate-ping"></div>
            </div>
          </div>
          <h1 className={`text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`} style={{ animationDelay: '500ms' }}>
            Monday CRM
          </h1>
          <p className={`text-muted-foreground text-xl font-medium transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`} style={{ animationDelay: '700ms' }}>
            Welcome to your workspace
          </p>
        </div>

        {/* Enhanced Login Card */}
        <Card className={`backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 border-0 shadow-2xl rounded-3xl transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`} style={{ animationDelay: '900ms' }}>
          <CardHeader className="space-y-6 pb-8 pt-8">
            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Secure Login
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Enter your credentials to continue
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Enhanced Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold text-foreground flex items-center gap-3">
                  <Mail className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`h-14 bg-white/60 dark:bg-slate-800/60 border-2 text-lg rounded-2xl transition-all duration-300 ${
                      focusedField === 'email' 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-white/80 dark:bg-slate-800/80' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    required
                    disabled={isLoading}
                  />
                  <div className={`absolute left-4 top-0 h-full w-1 rounded-full transition-all duration-300 ${
                    focusedField === 'email' ? 'bg-blue-500 opacity-100' : 'bg-transparent opacity-0'
                  }`}></div>
                </div>
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold text-foreground flex items-center gap-3">
                  <Lock className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`h-14 bg-white/60 dark:bg-slate-800/60 border-2 text-lg rounded-2xl pr-14 transition-all duration-300 ${
                      focusedField === 'password' 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-white/80 dark:bg-slate-800/80' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 rounded-xl transition-all duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                  <div className={`absolute left-4 top-0 h-full w-1 rounded-full transition-all duration-300 ${
                    focusedField === 'password' ? 'bg-blue-500 opacity-100' : 'bg-transparent opacity-0'
                  }`}></div>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <Button
                type="submit"
                className={`w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl transition-all duration-300 transform ${
                  !isLoading && formData.email && formData.password 
                    ? 'hover:scale-105 hover:shadow-2xl' 
                    : ''
                }`}
                disabled={isLoading || !formData.email || !formData.password}
              >
                <div className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span>Sign In</span>
                      <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-3 text-center">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Footer */}
        <div className={`text-center mt-12 transition-all duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`} style={{ animationDelay: '1100ms' }}>
          <p className="text-muted-foreground text-lg font-medium">
            © 2024 Monday CRM
          </p>
          <p className="text-muted-foreground/70 text-sm mt-2">
            Built with ❤️ for modern teams
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 