import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ChefHat, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; confirmPassword?: string }>({});
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Check for reset mode from URL
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  // Redirect if already logged in (except during password reset)
  useEffect(() => {
    if (user && !isLoading && mode !== 'reset') {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate, mode]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string; confirmPassword?: string } = {};
    
    if (mode === 'forgot') {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (mode === 'reset') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (mode === 'signup') {
      const nameResult = nameSchema.safeParse(name);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message || 'Failed to send reset email');
        } else {
          setResetEmailSent(true);
          toast.success('Password reset email sent! Check your inbox.');
        }
        return;
      }

      if (mode === 'reset') {
        const { error } = await updatePassword(password);
        if (error) {
          toast.error(error.message || 'Failed to update password');
        } else {
          toast.success('Password updated successfully!');
          setMode('login');
          navigate('/auth', { replace: true });
        }
        return;
      }

      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Please verify your email before logging in.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back! 🎉');
          navigate('/', { replace: true });
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, name);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('This email is already registered. Please log in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Welcome to Savor & Save! 🍛');
          navigate('/', { replace: true });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setErrors({});
    setResetEmailSent(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white mb-4 shadow-lg">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Savor & Save
          </h1>
          <p className="text-muted-foreground mt-2">Your personal food companion</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-8">
            {/* Toggle - only show for login/signup */}
            {(mode === 'login' || mode === 'signup') && (
              <div className="flex rounded-xl bg-orange-50 p-1 mb-8">
                <button
                  onClick={() => { setMode('login'); resetForm(); }}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'login'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-muted-foreground hover:text-orange-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('signup'); resetForm(); }}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-muted-foreground hover:text-orange-600'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Back button for forgot/reset modes */}
            {(mode === 'forgot' || mode === 'reset') && (
              <button
                onClick={() => { setMode('login'); resetForm(); }}
                className="flex items-center text-muted-foreground hover:text-orange-600 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </button>
            )}

            {/* Forgot Password Title */}
            {mode === 'forgot' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Forgot Password?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {resetEmailSent 
                    ? "We've sent you an email with a link to reset your password."
                    : "Enter your email and we'll send you a link to reset your password."
                  }
                </p>
              </div>
            )}

            {/* Reset Password Title */}
            {mode === 'reset' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Reset Password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your new password below.
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {!resetEmailSent ? (
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Name field (signup only) */}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
                          className={`pl-10 h-12 bg-orange-50/50 border-orange-100 focus:border-orange-300 focus:ring-orange-200 ${errors.name ? 'border-red-300' : ''}`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                  )}

                  {/* Email field (not for reset) */}
                  {mode !== 'reset' && (
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                          className={`pl-10 h-12 bg-orange-50/50 border-orange-100 focus:border-orange-300 focus:ring-orange-200 ${errors.email ? 'border-red-300' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  )}

                  {/* Password field (not for forgot) */}
                  {mode !== 'forgot' && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        {mode === 'reset' ? 'New Password' : 'Password'}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                          className={`pl-10 pr-10 h-12 bg-orange-50/50 border-orange-100 focus:border-orange-300 focus:ring-orange-200 ${errors.password ? 'border-red-300' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password}</p>
                      )}
                    </div>
                  )}

                  {/* Confirm Password field (reset only) */}
                  {mode === 'reset' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
                          className={`pl-10 h-12 bg-orange-50/50 border-orange-100 focus:border-orange-300 focus:ring-orange-200 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}

                  {/* Forgot password link */}
                  {mode === 'login' && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); resetForm(); }}
                        className="text-sm text-orange-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-xl shadow-lg shadow-orange-200/50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' && 'Sign In'}
                        {mode === 'signup' && 'Create Account'}
                        {mode === 'forgot' && 'Send Reset Link'}
                        {mode === 'reset' && 'Update Password'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { setMode('login'); resetForm(); }}
                    className="border-orange-100 hover:bg-orange-50"
                  >
                    Back to Sign In
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider - only show for login/signup */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-orange-100"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-muted-foreground">or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isSubmitting}
                  className="w-full h-12 border-orange-100 hover:bg-orange-50 rounded-xl font-medium"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                {/* Footer text */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); resetForm(); }}
                    className="text-orange-600 font-medium hover:underline"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Food illustrations */}
        <div className="mt-8 flex gap-4 text-4xl">
          <span>🍛</span>
          <span>🥘</span>
          <span>🍲</span>
          <span>🥗</span>
          <span>🍜</span>
        </div>
      </div>
    </div>
  );
}