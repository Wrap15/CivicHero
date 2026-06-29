'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { 
  Trophy, 
  Sparkles, 
  Zap, 
  CheckCircle, 
  MapPin, 
  Clock, 
  Award, 
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Monthly Challenges
  const challenges = [
    {
      id: 'ch_1',
      title: 'Pavement Patrol',
      description: 'Report 3 road defects or pothole locations in your ward.',
      reward: '200 XP',
      progress: '1/3 reports completed',
      percent: 33,
      ends: 'July 15, 2026'
    },
    {
      id: 'ch_2',
      title: 'Super Verifier',
      description: 'Cast 10 verification votes on new citizen complaints.',
      reward: '300 XP',
      progress: '8/10 votes completed',
      percent: 80,
      ends: 'July 31, 2026'
    },
    {
      id: 'ch_3',
      title: 'Monsoon Sentry',
      description: 'Report or verify clogged drainage systems to prevent local flooding.',
      reward: '150 XP',
      progress: '0/1 drainage report',
      percent: 0,
      ends: 'July 20, 2026'
    }
  ];

  // Protect route
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load leaderboard
  useEffect(() => {
    const loadLeaders = async () => {
      try {
        const list = await userService.getLeaderboard();
        setLeaders(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLeaders();
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 1) return <Trophy className="w-5 h-5 text-zinc-350" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-amber-700" />;
    return <span className="text-zinc-500 font-mono font-bold">{rank + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Leaderboard Rankings (col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Civic Heroes Leaderboard</span>
            </h1>
            <p className="text-zinc-500 text-xs mt-1">Top-ranking citizens who have earned the most XP by reporting and verifying municipal issues.</p>
          </div>

          {/* Leaderboard Card */}
          <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-850 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
              <div className="flex items-center space-x-6">
                <span className="w-8 text-center">Rank</span>
                <span>User</span>
              </div>
              <div className="flex items-center space-x-12">
                <span className="w-16 text-center">Level</span>
                <span className="w-16 text-center">Votes Cast</span>
                <span className="w-16 text-right">Contribution</span>
              </div>
            </div>

            <div className="divide-y divide-zinc-850">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <span className="text-xs text-zinc-500 mt-2 block">Calculating points...</span>
                </div>
              ) : (
                leaders.map((leader, index) => {
                  const isSelf = user && leader.uid === user.uid;
                  return (
                    <div 
                      key={leader.uid} 
                      className={`p-4 flex items-center justify-between text-xs transition-colors ${
                        isSelf ? 'bg-emerald-500/5 text-emerald-400 font-semibold' : 'text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center space-x-6">
                        <div className="w-8 flex justify-center">{getRankBadge(index)}</div>
                        <div className="flex items-center space-x-2.5">
                          <img 
                            src={leader.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${leader.fullName}`} 
                            alt={leader.fullName} 
                            className="w-7 h-7 rounded-full border border-zinc-800"
                          />
                          <span className={isSelf ? 'text-white' : 'text-zinc-200'}>{leader.fullName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-12">
                        <span className="w-16 text-center text-zinc-400 font-bold">Lvl {leader.level || 1}</span>
                        <span className="w-16 text-center text-zinc-400 font-bold">{leader.verifiedScore || 0}</span>
                        <span className="w-16 text-right font-mono font-bold text-emerald-400">{leader.xp} XP</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Monthly Challenges & Gamification Rules (col 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Challenges Card */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <Star className="w-4.5 h-4.5" />
                <span>Monthly Challenges</span>
              </h2>
              <p className="text-[10px] text-zinc-500 mt-1">Complete challenges by July 31st to earn massive bonus XP.</p>
            </div>

            <div className="space-y-4">
              {challenges.map((ch) => (
                <div key={ch.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{ch.title}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                      {ch.reward}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-zinc-400 leading-normal">{ch.description}</p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-zinc-500">
                      <span>Progress: {ch.progress}</span>
                      <span>{ch.percent}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${ch.percent}%` }}
                      />
                    </div>
                  </div>

                  <span className="block text-[9px] text-zinc-650 italic">Ends on {ch.ends}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How to Earn XP Card */}
          <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Contribution Mechanics</span>
            </h3>
            
            <div className="text-[11px] text-zinc-400 space-y-2.5 leading-relaxed">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong className="text-zinc-200">File a Report (+50 XP):</strong> Upload a geolocated photo of a municipal issue to help department workers discover it.</p>
              </div>
              
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong className="text-zinc-200">Verify Neighbors' Claims (+15 XP):</strong> Inspect reported issues near your coordinates and vote to verify or mark as fake.</p>
              </div>

              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong className="text-zinc-200">Resolution Bonus (+100 XP):</strong> Receive a major XP reward when an issue you reported is officially marked as resolved by city workers.</p>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
