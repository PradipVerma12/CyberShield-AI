'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// Deterministic pseudo-random number generator for SSR/Hydration consistency
function pseudoRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface ParticleProps {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

function Particle({ id, x, y, size, delay }: ParticleProps) {
  const colorToggle = pseudoRandom(id * 1.5) > 0.5;
  const alpha = 0.2 + pseudoRandom(id * 2.3) * 0.4;
  const duration = 6 + pseudoRandom(id * 3.7) * 4;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `rgba(${colorToggle ? '59,130,246' : '139,92,246'}, ${alpha})`,
        filter: 'blur(1px)',
      }}
      animate={{
        y: [0, -30, 10, -20, 0],
        x: [0, 10, -5, 15, 0],
        opacity: [0.3, 0.8, 0.4, 0.9, 0.3],
        scale: [1, 1.2, 0.9, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

const particles: ParticleProps[] = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: pseudoRandom(i * 12.3) * 100,
  y: pseudoRandom(i * 45.6) * 100,
  size: 4 + pseudoRandom(i * 78.9) * 8,
  delay: pseudoRandom(i * 32.1) * 3,
}));

export default function LoginPage() {
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const regForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data.email, data.password, data.rememberMe ?? false);
      const { user, accessToken, refreshToken } = res.data;
      storeLogin(user, accessToken, refreshToken);
      setAuthSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data.name, data.email, data.password);
      const { user, accessToken, refreshToken } = res.data;
      storeLogin(user, accessToken, refreshToken);
      setAuthSuccess(true);
      toast.success('Account created! Welcome to CyberShield AI');
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Email may already be in use.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#090B14' }}>
      {/* Left Panel: Hero */}
      <div
        className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden p-16"
        style={{
          background: 'linear-gradient(135deg, #090B14 0%, #0f172a 50%, #090B14 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}

        <div
          className="absolute"
          style={{
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <motion.div
          className="relative z-10 mb-12"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="relative"
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(59,130,246,0.5))',
                'drop-shadow(0 0 60px rgba(59,130,246,0.9))',
                'drop-shadow(0 0 20px rgba(59,130,246,0.5))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield className="text-blue-500" style={{ width: 120, height: 120 }} strokeWidth={1.2} />
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center relative z-10 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1
            className="text-4xl font-bold mb-4 leading-tight"
            style={{ color: '#fff', textShadow: '0 0 40px rgba(59,130,246,0.3)' }}
          >
            Enterprise-Grade{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Security
            </span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#9CA3AF' }}>
            Protect your digital assets with real-time threat intelligence, AI-driven analysis and military-grade encryption.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-3 mt-10 justify-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {['🔍 Threat Detection', '🔐 AES-256 Encryption', '📧 Phishing Analysis', '🛡️ Port Scanning'].map(
            (feat) => (
              <div
                key={feat}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#9CA3AF',
                }}
              >
                {feat}
              </div>
            )
          )}
        </motion.div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex-1 lg:max-w-[520px] flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Shield className="text-blue-500" style={{ width: 32, height: 32 }} />
            <span className="text-xl font-bold text-white">CyberShield AI</span>
          </div>

          <div
            className="relative rounded-3xl p-8"
            style={{
              background: 'rgba(17,24,39,0.7)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            <AnimatePresence>
              {authSuccess && (
                <motion.div
                  className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center z-20"
                  style={{ background: 'rgba(17,24,39,0.95)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircle className="text-emerald-400 mb-4" style={{ width: 64, height: 64 }} />
                  </motion.div>
                  <p className="text-white font-semibold text-lg">
                    {isRegisterMode ? 'Account Created' : 'Authenticated Successfully'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Redirecting to console…</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 mb-6 rounded-xl bg-white/5 border border-white/5">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isRegisterMode ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isRegisterMode ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isRegisterMode ? 'Create security account' : 'Welcome back'}
              </h2>
              <p style={{ color: '#9CA3AF' }} className="text-sm mt-1">
                {isRegisterMode
                  ? 'Get started with a fresh isolated security console'
                  : 'Sign in to your security console'}
              </p>
            </div>

            {/* Form */}
            {!isRegisterMode ? (
              /* LOGIN FORM */
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ width: 16, height: 16, color: '#6B7280' }}
                    />
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      placeholder="demo@cybershield.ai"
                      className="input-field pl-10"
                      autoComplete="email"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <AlertCircle style={{ width: 12, height: 12, color: '#EF4444' }} />
                      <p className="text-xs" style={{ color: '#EF4444' }}>
                        {loginForm.formState.errors.email.message}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ width: 16, height: 16, color: '#6B7280' }}
                    />
                    <input
                      {...loginForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="input-field pl-10 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#6B7280' }}
                    >
                      {showPassword ? (
                        <EyeOff style={{ width: 16, height: 16 }} />
                      ) : (
                        <Eye style={{ width: 16, height: 16 }} />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <AlertCircle style={{ width: 12, height: 12, color: '#EF4444' }} />
                      <p className="text-xs" style={{ color: '#EF4444' }}>
                        {loginForm.formState.errors.password.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      {...loginForm.register('rememberMe')}
                      type="checkbox"
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm" style={{ color: '#9CA3AF' }}>
                      Remember me
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || authSuccess}
                  className="btn-primary w-full h-12 text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating…
                    </div>
                  ) : (
                    <>
                      <Lock style={{ width: 16, height: 16 }} />
                      Sign In Securely
                    </>
                  )}
                </button>

                <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', color: '#9CA3AF' }}>
                  <span className="font-medium" style={{ color: '#3B82F6' }}>Seeded Demo User: </span>
                  demo@cybershield.ai / Demo1234!
                </div>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={regForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#9CA3AF' }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 16, height: 16, color: '#6B7280' }} />
                    <input
                      {...regForm.register('name')}
                      type="text"
                      placeholder="Jane Doe"
                      className="input-field pl-10"
                    />
                  </div>
                  {regForm.formState.errors.name && (
                    <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                      {regForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#9CA3AF' }}>
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 16, height: 16, color: '#6B7280' }} />
                    <input
                      {...regForm.register('email')}
                      type="email"
                      placeholder="jane@company.com"
                      className="input-field pl-10"
                    />
                  </div>
                  {regForm.formState.errors.email && (
                    <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                      {regForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#9CA3AF' }}>
                    Password (min 8 chars, 1 uppercase, 1 number)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 16, height: 16, color: '#6B7280' }} />
                    <input
                      {...regForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input-field pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#6B7280' }}
                    >
                      {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                  {regForm.formState.errors.password && (
                    <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
                      {regForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || authSuccess}
                  className="btn-primary w-full h-12 text-base mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account…
                    </div>
                  ) : (
                    'Register Isolated Console'
                  )}
                </button>

                <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: '#9CA3AF' }}>
                  <span className="font-medium" style={{ color: '#10B981' }}>Isolated Account: </span>
                  New accounts start with empty/zero data isolated to your own user ID.
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
