import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/context/AuthContext";
import { ActivityProvider } from "@/context/ActivityContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import EmailIntegration from "./pages/EmailIntegration";
import MyWorks from "./pages/MyWorks";
import PrivateRoute from "@/components/auth/PrivateRoute";
import { GmailAuthCallback } from "@/components/GmailAuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserProvider>
        <ActivityProvider>
          <TooltipProvider>
            <div className="min-h-screen relative overflow-hidden bg-white dark:bg-black">
              {/* Apple-inspired subtle background */}
              <div className="absolute inset-0">
                {/* Elegant gradient orbs */}
                <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-gentle-float"></div>
                <div className="absolute top-0 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-gentle-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-40 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full mix-blend-multiply filter blur-3xl animate-gentle-float" style={{ animationDelay: '4s' }}></div>
              </div>
              
              {/* Subtle radial gradients for depth */}
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 20%, rgba(54, 158, 255, 0.03) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(52, 211, 153, 0.02) 0%, transparent 50%)
                `
              }}></div>
              
              {/* Premium glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-white/40 dark:from-black/60 dark:via-black/20 dark:to-black/40 backdrop-blur-[0.5px]"></div>
              
              {/* Main content */}
              <div className="relative z-10 min-h-screen">
                <BrowserRouter>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Gmail OAuth Callback Route */}
                    <Route path="/auth/gmail/callback" element={<GmailAuthCallback />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <PrivateRoute>
                        <Index />
                      </PrivateRoute>
                    } />
                    
                    {/* My Works Route */}
                    <Route path="/my-works" element={
                      <PrivateRoute>
                        <MyWorks />
                      </PrivateRoute>
                    } />
                    
                    {/* Email Integration Route */}
                    <Route path="/email-integration" element={
                      <PrivateRoute>
                        <EmailIntegration />
                      </PrivateRoute>
                    } />
                    
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Board specific routes (protected) */}
                    <Route path="/board/:id" element={
                      <PrivateRoute>
                        <Index />
                      </PrivateRoute>
                    } />
                    
                    {/* Admin routes (Super Admin only) */}
                    <Route path="/admin" element={
                      <PrivateRoute>
                        <div className="p-8 text-center">
                          <h1 className="text-2xl font-bold text-gradient-apple mb-4">Admin Panel</h1>
                          <p className="text-muted-foreground">Coming Soon - Super Admin Dashboard</p>
                        </div>
                      </PrivateRoute>
                    } />
                    
                    {/* Catch all - 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </div>
              
              {/* Apple-style Toasters */}
              <Toaster />
              <Sonner 
                position="bottom-right"
                toastOptions={{
                  className: "apple-card shadow-apple-lg border-0",
                  style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  }
                }}
              />
            </div>
          </TooltipProvider>
        </ActivityProvider>
      </UserProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
