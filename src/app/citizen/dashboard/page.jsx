'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { issueService } from '@/services/issueService';
import { aiService } from '@/services/aiService';
import { userService } from '@/services/userService';
import { 
  Trophy, 
  MapPin, 
  Clock, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  Calendar,
  AlertCircle,
  Play,
  Volume2,
  Send,
  Loader2,
  ChevronRight
} from 'lucide-react';

function CitizenDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();

  // Selected issue
  const urlIssueId = searchParams.get('issueId');
  const [selectedIssueId, setSelectedIssueId] = useState(urlIssueId || null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Lists
  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [votes, setVotes] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);

  // Form inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [voteComment, setVoteComment] = useState('');
  const [voteType, setVoteType] = useState('confirm'); // 'confirm' | 'reject'
  
  // Status states
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [voting, setVoting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [voted, setVoted] = useState(false);

  // Protect route
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load initial data
  const loadData = async () => {
    try {
      const allIssues = await issueService.getAllIssues();
      setIssues(allIssues);
      setFilteredIssues(allIssues);
      
      if (user) {
        const achs = await userService.getAchievements(user.uid);
        setAchievements(achs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Load specific issue details
  useEffect(() => {
    const loadIssueDetails = async () => {
      if (!selectedIssueId) {
        setSelectedIssue(null);
        return;
      }
      try {
        const iss = await issueService.getIssueById(selectedIssueId);
        setSelectedIssue(iss);
        if (iss) {
          const comms = await issueService.getComments(selectedIssueId);
          setComments(comms);
          const vts = await issueService.getVotes(selectedIssueId);
          setVotes(vts);
          
          // Check if current user has already voted
          if (user) {
            const hasVoted = vts.some(v => v.userId === user.uid);
            setVoted(hasVoted);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadIssueDetails();
  }, [selectedIssueId, user, issues]);

  // Sync selected issue from URL search params
  useEffect(() => {
    if (urlIssueId) {
      setSelectedIssueId(urlIssueId);
    }
  }, [urlIssueId]);

  // Run AI/Heuristic Search
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredIssues(issues);
      return;
    }
    setSearching(true);
    try {
      // Direct call to client side filtering (which replicates the API search call)
      const results = await aiService.searchIssues(searchQuery, issues);
      setFilteredIssues(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Cast Vote
  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue || voted) return;
    setVoting(true);

    try {
      await issueService.castVote(selectedIssue.id, user, voteType, voteComment);
      setVoted(true);
      setVoteComment('');
      
      // Reload issue details to refresh stats
      const vts = await issueService.getVotes(selectedIssue.id);
      setVotes(vts);
      
      // Refresh user stats (XP, level)
      await refreshUser();
      
      // Reload list to update status markers
      const allIssues = await issueService.getAllIssues();
      setIssues(allIssues);
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  };

  // Add Comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue || !commentContent.trim()) return;
    setCommenting(true);

    try {
      const comm = await issueService.addComment(selectedIssue.id, commentContent.trim(), user);
      setComments(prev => [...prev, comm]);
      setCommentContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setCommenting(false);
    }
  };

  // Helpers
  const getStatusStep = (status) => {
    const steps = ['reported', 'ai_verified', 'citizen_verified', 'assigned', 'in_progress', 'resolved'];
    return steps.indexOf(status);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'reported': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ai_verified': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'citizen_verified': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'assigned': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      {/* Gamification Header */}
      {user && (
        <section className="bg-zinc-900/30 border-b border-zinc-900 py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-14 h-14 rounded-full border-2 border-emerald-500/40"
              />
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-1.5">
                  <span>{user.fullName}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Level {user.level || 1} Citizen
                  </span>
                </h2>
                <div className="flex items-center space-x-3 mt-1.5">
                  <div className="w-36 bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${(user.xp % 200) / 2}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 font-mono font-bold">
                    {user.xp} XP
                  </span>
                  <span className="text-xs text-zinc-500">
                    ({200 - (user.xp % 200)} XP to Next Level)
                  </span>
                </div>
              </div>
            </div>

            {/* Platform achievements */}
            <div className="flex items-center space-x-6">
              
              <div className="text-center md:text-left">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500">Verification Rank</span>
                <span className="text-xl font-black text-emerald-400">#{user.verifiedScore || 0}</span>
                <span className="text-[10px] text-zinc-400 block">votes cast</span>
              </div>

              <div className="h-10 w-px bg-zinc-800 hidden md:block" />

              <div className="text-center md:text-left">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500">Unlocked Badges</span>
                <div className="flex space-x-1.5 mt-1">
                  {achievements.length === 0 ? (
                    <span className="text-zinc-600 text-xs italic">No badges earned yet.</span>
                  ) : (
                    achievements.map((ach) => (
                      <div 
                        key={ach.id} 
                        className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[10px] text-zinc-300 flex items-center space-x-1"
                        title={ach.description}
                      >
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>{ach.badgeName}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Search and Issues catalog (col 5) */}
        <div className={`lg:col-span-5 flex flex-col space-y-4 ${selectedIssueId ? 'hidden lg:flex' : 'flex'}`}>
          <div>
            <h2 className="text-lg font-bold text-white">Wards Complaint Feed</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Filter by category or query issues with AI search.</p>
          </div>

          {/* AI Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <span className="absolute left-3 text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Unresolved potholes near park"
              className="w-full pl-9 pr-16 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {searching ? 'Querying...' : 'AI Find'}
            </button>
          </form>

          {/* Catalog list */}
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1.5">
            {loading ? (
              <div className="text-center py-10">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                <span className="text-xs text-zinc-500 mt-2 block">Loading complaints...</span>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-12 border border-zinc-800 border-dashed rounded-2xl bg-zinc-950/20">
                <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-zinc-400">No issues matching search criteria</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Try keywords like 'pothole', 'garbage', or clear the search.</p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedIssueId === issue.id 
                      ? 'bg-zinc-900 border-emerald-500/30' 
                      : 'bg-zinc-900/30 border-zinc-850 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider">
                      {issue.category}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold capitalize ${getStatusBadgeClass(issue.status)}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1.5 truncate">{issue.title}</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1 leading-normal">{issue.description}</p>
                  
                  <div className="flex items-center justify-between mt-3 text-[9px] text-zinc-500">
                    <span className="truncate max-w-[200px]">📍 {issue.address}</span>
                    <span suppressHydrationWarning>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detailed View, Voting, Comments (col 7) */}
        <div className={`lg:col-span-7 ${selectedIssueId ? 'block' : 'hidden lg:block'}`}>
          {selectedIssue ? (
            <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-6 h-fit max-h-[800px] overflow-y-auto pr-2">
              
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedIssueId(null)}
                className="lg:hidden flex items-center space-x-1.5 text-xs text-emerald-450 font-bold mb-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-850"
              >
                <span>← Back to Feed</span>
              </button>

              {/* Detailed Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/10">
                    {selectedIssue.category}
                  </span>
                  
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold capitalize ${getStatusBadgeClass(selectedIssue.status)}`}>
                      {selectedIssue.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 font-bold capitalize">
                      {selectedIssue.severity} Severity
                    </span>
                  </div>
                </div>

                <h1 className="text-lg md:text-xl font-extrabold text-white leading-tight">
                  {selectedIssue.title}
                </h1>
                
                <p className="text-xs text-zinc-500 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{selectedIssue.address}</span>
                </p>
              </div>

              {/* Status Timeline Progress */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-3 tracking-wider">Resolution Timeline</span>
                <div className="flex items-center justify-between relative">
                  
                  {/* Timeline progress line */}
                  <div className="absolute top-3 left-6 right-6 h-0.5 bg-zinc-850 z-0" />
                  <div 
                    className="absolute top-3 left-6 h-0.5 bg-emerald-500 z-0 transition-all duration-500" 
                    style={{ width: `${(getStatusStep(selectedIssue.status) / 5) * 100}%` }}
                  />

                  {/* Step dots */}
                  {['reported', 'citizen_verified', 'assigned', 'in_progress', 'resolved'].map((step, idx) => {
                    const active = getStatusStep(selectedIssue.status) >= idx;
                    const label = step.replace('_', ' ');
                    return (
                      <div key={step} className="flex flex-col items-center z-10 w-12 text-center">
                        <div className={`w-6.5 h-6.5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                          active 
                            ? 'bg-emerald-500 text-black border-emerald-400' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[8px] mt-1.5 capitalize font-medium ${
                          active ? 'text-zinc-200' : 'text-zinc-500'
                        }`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photo & Voice Note Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full h-44 rounded-xl overflow-hidden border border-zinc-850">
                  <img 
                    src={selectedIssue.imageUrl || 'https://images.unsplash.com/photo-1599740831146-80e6f87ad60b?auto=format&fit=crop&w=800&q=80'} 
                    alt={selectedIssue.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="block text-[9px] uppercase font-bold text-zinc-500">Citizen Reporter</span>
                    <span className="block text-xs font-bold text-zinc-200">
                      {selectedIssue.isAnonymous ? 'Anonymous Citizen' : selectedIssue.reporterName}
                    </span>
                    <p className="text-[10.5px] text-zinc-400 leading-relaxed font-mono" suppressHydrationWarning>
                      Reported: {new Date(selectedIssue.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {selectedIssue.voiceUrl && (
                    <div className="mt-3 p-2 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <audio src={selectedIssue.voiceUrl} controls className="h-6 w-full" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="block text-[9px] uppercase font-bold text-zinc-500">Citizen Description</span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-xl border border-zinc-850/50">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Gemini technical recommendations */}
              {selectedIssue.aiAnalysis && (
                <div className="bg-emerald-500/[0.01] p-4 rounded-xl border border-emerald-500/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Safety scan</span>
                  </span>
                  <div className="text-xs text-zinc-400 leading-normal space-y-1">
                    <p><strong className="text-zinc-200">Technical Advice:</strong> {selectedIssue.aiAnalysis.repairRecommendation}</p>
                    <p className="text-[10.5px] text-zinc-500 mt-1">AI Priority Confidence: {Math.round(selectedIssue.aiConfidence * 100)}%</p>
                  </div>
                </div>
              )}

              {/* Community Voting / Verification Section */}
              {selectedIssue.status === 'reported' && (
                <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Community Verification</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Nearby citizens must verify this issue exists. Verify to earn XP and increase your rank score.
                    </p>
                  </div>

                  {voted ? (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs rounded-lg flex items-center space-x-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Thank you! Your verification vote has been logged. (+15 XP awarded)</span>
                    </div>
                  ) : (
                    <form onSubmit={handleVoteSubmit} className="space-y-3">
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => setVoteType('confirm')}
                          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                            voteType === 'confirm'
                              ? 'bg-emerald-500 border-emerald-400 text-black'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Confirm (It's real)</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setVoteType('reject')}
                          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                            voteType === 'reject'
                              ? 'bg-rose-500 border-rose-400 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Reject (Fake/Spam)</span>
                        </button>
                      </div>

                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={voteComment}
                          onChange={(e) => setVoteComment(e.target.value)}
                          placeholder="Add comments or visual evidence details (optional)..."
                          className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                        />
                        
                        <button
                          type="submit"
                          disabled={voting}
                          className="px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {voting ? 'Voting...' : 'Vote'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Vote Statistics */}
                  <div className="flex items-center space-x-4 text-[10px] text-zinc-500 font-mono">
                    <span>Yes votes: <strong className="text-emerald-400">{votes.filter(v => v.vote === 'confirm').length}</strong></span>
                    <span>No votes: <strong className="text-rose-400">{votes.filter(v => v.vote === 'reject').length}</strong></span>
                    <span>(Requires 2 Confirm votes to promote to Municipal Department Queue)</span>
                  </div>

                </div>
              )}

              {/* Comments Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-900">
                <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Citizen & Department Discussion</span>
                
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic py-2">No comments posted yet. Start the conversation.</p>
                  ) : (
                    comments.map((comm) => (
                      <div key={comm.id} className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-850/80 flex items-start space-x-3">
                        <img 
                          src={comm.userAvatar} 
                          alt={comm.userName} 
                          className="w-7 h-7 rounded-full border border-zinc-800" 
                        />
                        <div className="text-xs space-y-1">
                          <div className="flex items-center space-x-2">
                            <strong className="text-zinc-200">{comm.userName}</strong>
                            <span className="text-[9px] text-zinc-500" suppressHydrationWarning>
                              {new Date(comm.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-zinc-300 leading-relaxed text-[11px]">{comm.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    required
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Ask a question or offer to volunteer help..."
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={commenting}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {commenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="h-[500px] border border-dashed border-zinc-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-zinc-900/[0.05]">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 animate-pulse-ring mb-4">
                <ChevronRight className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-zinc-300">Select an issue from feed</h3>
              <p className="text-[11px] text-zinc-500 mt-1.5 max-w-xs leading-normal">
                Inspect details, play voice reports, vote to confirm or reject claims, and read municipal resolution notes.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default function CitizenDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-550 text-xs">Loading Dashboard...</span>
        </div>
      </div>
    }>
      <CitizenDashboardContent />
    </Suspense>
  );
}


