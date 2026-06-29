'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'citizen') {
        router.push('/citizen/dashboard');
      } else if (loggedUser.role === 'official') {
        router.push('/government/dashboard');
      } else if (loggedUser.role === 'admin') {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser.role === 'citizen') {
        router.push('/citizen/dashboard');
      } else if (loggedUser.role === 'official') {
        router.push('/government/dashboard');
      } else if (loggedUser.role === 'admin') {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(16,185,129,0.08),rgba(255,255,255,0))] px-6 py-12">
      <div className="w-full max-w-md">
        
        {/* Logo and title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-black font-extrabold shadow-lg shadow-emerald-500/10">CH</div>
            <span className="font-extrabold text-xl text-white">CivicHero</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-zinc-500 text-xs mt-1.5">Sign in to solve hyperlocal problems in your ward</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl border border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@civichero.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-400">Password</label>
                <a href="#" className="text-[10px] text-emerald-400 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="relative my-4 flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-900"></div>
              <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase font-bold tracking-wide">Or continue with</span>
              <div className="flex-grow border-t border-zinc-900"></div>
            </div>

            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white hover:bg-zinc-850 font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.727 5.727 0 0 1 8.2 12.875a5.727 5.727 0 0 1 5.79-5.725c1.468 0 2.8.5 3.84 1.487l3.078-3.078A9.92 9.92 0 0 0 13.99 2.75c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.766 0 9.87-4.053 9.87-10 0-.615-.054-1.2-.16-1.765H12.24Z"
                />
              </svg>
              <span>Sign In with Google</span>
            </motion.button>
          </form>


        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-emerald-400 hover:underline font-semibold">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
