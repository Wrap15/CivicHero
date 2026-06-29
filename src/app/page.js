'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Map, 
  PlusCircle, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Users,
  Activity,
  CheckCircle,
  BrainCircuit,
  MessageSquareHeart
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [loadingRole, setLoadingRole] = useState(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to trigger 1-click demo logins
  const handleDemoLogin = async (email, redirectPath, roleName) => {
    setLoadingRole(roleName);
    try {
      await login(email, 'password123'); // Demo accounts use mock credentials
      router.push(redirectPath);
    } catch (err) {
      console.error(err);
      alert('Demo login failed. Running client state refresh.');
    } finally {
      setLoadingRole(null);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 16 }
    }
  };

  return (
    <div className="flex-1 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] overflow-hidden">
      
      {/* Header / Nav */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 py-5 max-w-7xl mx-auto flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-emerald-600 to-emerald-400 p-2 rounded-xl text-black font-bold shadow-lg shadow-emerald-500/20">
            CH
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">CivicHero</span>
            <span className="block text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Hyperlocal Solver</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {mounted && user ? (
            <Link 
              href={
                user.role === 'citizen' ? '/citizen/dashboard' : 
                user.role === 'official' ? '/government/dashboard' : '/admin/dashboard'
              } 
              className="px-4 py-2 text-sm bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Back to Dashboard ({user.fullName})
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Log In
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg shadow-md shadow-emerald-500/10 transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6"
        >
          Empowering Communities.<br/>
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Solving Problems in Real-Time.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-zinc-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
        >
          CivicHero connects citizens and municipal departments. Report issues instantly with AI analysis, collaborate on verifications, track progress, and earn civic rewards.
        </motion.p>

        {/* Action Gateways - 1 Click Logins */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20 text-left"
        >
          
          {/* Citizen Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.015 }}
            className="glass-panel glass-panel-hover p-6 rounded-2xl border border-zinc-800/80 flex flex-col justify-between h-64 relative overflow-hidden group"
          >
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            <div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Citizen Hub</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Submit problems, record voice descriptions, vote to verify neighbors' reports, unlock badges, and top the leaderboards.
              </p>
            </div>
            <button
              onClick={() => handleDemoLogin('citizen@civichero.org', '/citizen/dashboard', 'citizen')}
              disabled={loadingRole !== null}
              className="mt-6 w-full flex items-center justify-between px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <span>{loadingRole === 'citizen' ? 'Logging in...' : '1-Click Citizen Demo'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Official Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.015 }}
            className="glass-panel glass-panel-hover p-6 rounded-2xl border border-zinc-800/80 flex flex-col justify-between h-64 relative overflow-hidden group"
          >
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            <div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Government Panel</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Access pending department queues, assign work orders, post repair images, and view historical resolution performance analytics.
              </p>
            </div>
            <button
              onClick={() => handleDemoLogin('official@civichero.org', '/government/dashboard', 'official')}
              disabled={loadingRole !== null}
              className="mt-6 w-full flex items-center justify-between px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-extrabold text-xs rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <span>{loadingRole === 'official' ? 'Logging in...' : '1-Click Official Demo'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Admin Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.015 }}
            className="glass-panel glass-panel-hover p-6 rounded-2xl border border-zinc-800/80 flex flex-col justify-between h-64 relative overflow-hidden group"
          >
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-zinc-500/5 rounded-full blur-2xl group-hover:bg-zinc-500/10 transition-colors" />
            <div>
              <div className="p-3 bg-zinc-800 text-zinc-300 rounded-xl w-fit mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Admin Control</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Audit system actions, investigate AI fraud/spam flags, override reports, ban users, and configure department settings.
              </p>
            </div>
            <button
              onClick={() => handleDemoLogin('admin@civichero.org', '/admin/dashboard', 'admin')}
              disabled={loadingRole !== null}
              className="mt-6 w-full flex items-center justify-between px-4 py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-150 font-extrabold text-xs rounded-xl transition-all border border-zinc-700 cursor-pointer"
            >
              <span>{loadingRole === 'admin' ? 'Logging in...' : '1-Click Admin Demo'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

        </motion.div>

        {/* Live Activity Ticker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto mb-16 p-3 bg-zinc-900/25 border border-zinc-800/40 rounded-xl flex items-center justify-between text-xs overflow-hidden"
        >
          <div className="flex items-center space-x-2 shrink-0 border-r border-zinc-800 pr-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-zinc-400 uppercase tracking-widest text-[9px]">Live Feed</span>
          </div>
          
          <div className="flex-1 overflow-hidden ml-4 relative h-5 flex items-center">
            <motion.div 
              animate={{ x: [0, -1200] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="absolute flex space-x-12 whitespace-nowrap text-zinc-450 select-none text-[11px]"
            >
              {[
                "📍 Garbage Overflow reported at Times Square (Pending community verification)",
                "✅ Broken Streetlight resolved on 8th Ave by Power & Water Department (+5 Trust Score to reporter)",
                "📍 Water Leakage reported at Grand Central Terminal (Auto-verified by trusted sentry)",
                "✅ Fallen Tree resolved on Broadway by Parks & Recreation (+15 XP to community)",
                "📍 Pothole reported near Madison Square Garden (Awaiting neighbor confirmation votes)",
                "✅ Traffic Signal Failure resolved on 42nd St by Traffic & Transit Commission"
              ].concat([
                "📍 Garbage Overflow reported at Times Square (Pending community verification)",
                "✅ Broken Streetlight resolved on 8th Ave by Power & Water Department (+5 Trust Score to reporter)",
                "📍 Water Leakage reported at Grand Central Terminal (Auto-verified by trusted sentry)",
                "✅ Fallen Tree resolved on Broadway by Parks & Recreation (+15 XP to community)",
                "📍 Pothole reported near Madison Square Garden (Awaiting neighbor confirmation votes)",
                "✅ Traffic Signal Failure resolved on 42nd St by Traffic & Transit Commission"
              ]).map((text, idx) => (
                <span key={idx}>{text}</span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Platform Stat Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/60 mb-24"
        >
          <div className="text-center p-3">
            <span className="block text-2xl md:text-3xl font-extrabold text-white">4,821</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Reports Logged</span>
          </div>
          <div className="text-center p-3 border-l border-zinc-800/60">
            <span className="block text-2xl md:text-3xl font-extrabold text-emerald-400">98.4%</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">AI Vision Accuracy</span>
          </div>
          <div className="text-center p-3 border-l border-zinc-800/60">
            <span className="block text-2xl md:text-3xl font-extrabold text-white">3,124</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Issues Solved</span>
          </div>
          <div className="text-center p-3 border-l border-zinc-800/60">
            <span className="block text-2xl md:text-3xl font-extrabold text-indigo-400">1.8 Days</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Avg Resolution Time</span>
          </div>
        </motion.div>

        {/* AI Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto space-y-12"
        >
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">Intelligent Infrastructure Management</h2>
            <p className="text-zinc-500 text-sm mt-2 max-w-xl mx-auto">
              We leverage Google Gemini 2.5 Flash to streamline verification and fast-track repairs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/80 text-center hover:border-emerald-500/30 transition-colors">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mx-auto mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white mb-2">Automatic Categorization</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Gemini Vision analyzes uploaded photos instantly to detect issue type, severity, and recommend repair steps.
              </p>
            </div>
            
            <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/80 text-center hover:border-emerald-500/30 transition-colors">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mx-auto mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white mb-2">Predictive Hotspots</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                AI scans historical complaint frequencies to predict seasonal failure patterns and allocate work orders proactively.
              </p>
            </div>

            <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/80 text-center hover:border-emerald-500/30 transition-colors">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white mb-2">Spam & Fraud Filter</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatically identifies duplicate claims and rejects irrelevant photos to protect municipal response budgets.
              </p>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/60 py-12 text-center text-xs bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-550">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} CivicHero Platform. Created for hyper-transparent community problem solving.</p>
          
          <div className="flex items-center space-x-1 text-zinc-400">
            <span>Designed & Built with</span>
            <motion.span 
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="inline-block mx-1 cursor-pointer select-none"
              title="Built with Love"
            >
              💜
            </motion.span>
            <span>by</span>
            <a 
              href="https://my-portfolio-nine-eta-63.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-extrabold text-white hover:text-emerald-400 transition-colors font-mono tracking-wider ml-1 hover:opacity-80"
            >
              DHAVAL PANCHAL
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
