'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { issueService } from '@/services/issueService';
import { 
  getUsers, 
  getAuditLogs, 
  addAuditLog, 
  getIssues, 
  updateIssueInDB, 
  deleteIssueFromDB 
} from '@/services/mockDataService';
import { 
  ShieldAlert, 
  Users, 
  ShieldCheck, 
  Trash2, 
  UserPlus, 
  FileText, 
  Check, 
  Ban,
  Slash,
  AlertTriangle,
  Loader2,
  FolderOpen
} from 'lucide-react';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Tab states
  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'users');

  // Data states
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [fraudIssues, setFraudIssues] = useState([]);
  const [issuesList, setIssuesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Protect route
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // Real-time Admin Data Observer
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Fetch Users once
      const allUsers = getUsers();
      setUsersList(allUsers);

      // 2. Fetch Audit Logs once
      const logs = getAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    }

    // 3. Subscribe to live issues feed for overview and fraud tabs
    const unsubscribe = issueService.subscribeToIssues((allIssues) => {
      setIssuesList(allIssues);
      const flagged = allIssues.filter(i => i.aiConfidence < 0.92 || i.severity === 'critical');
      setFraudIssues(flagged);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle Role change
  const handleRoleChange = async (targetUid, newRole) => {
    try {
      await userService.updateProfile(targetUid, { role: newRole });
      addAuditLog(user.uid, user.fullName, 'UPDATE_USER_ROLE', { targetUid, newRole });
      
      // Update local state
      setUsersList(prev => prev.map(u => u.uid === targetUid ? { ...u, role: newRole } : u));
      setAuditLogs(getAuditLogs());
      alert(`User role updated to: ${newRole}`);
    } catch (e) {
      console.error(e);
      alert('Failed to change user role.');
    }
  };

  // Block/Ban User
  const handleBanUser = (targetUid, fullName) => {
    const conf = window.confirm(`Are you sure you want to restrict user "${fullName}"? This logs an audit trail.`);
    if (!conf) return;

    try {
      addAuditLog(user.uid, user.fullName, 'BAN_USER', { targetUid, fullName });
      setAuditLogs(getAuditLogs());
      alert(`User ${fullName} restricted from posting.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle AI Override approval
  const handleOverrideApprove = (issueId, title) => {
    try {
      // Force promote status to citizen_verified
      updateIssueInDB(issueId, { status: 'citizen_verified', aiConfidence: 0.99 });
      addAuditLog(user.uid, user.fullName, 'AI_OVERRIDE_APPROVE', { issueId, title });
      
      // Reload states
      loadAdminData();
      alert(`AI warning overridden. "${title}" promoted to verified queue.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Force Resolve issue
  const handleForceResolve = (issueId, title) => {
    const conf = window.confirm(`Are you sure you want to administratively FORCE RESOLVE issue "${title}"?`);
    if (!conf) return;

    try {
      updateIssueInDB(issueId, { status: 'resolved' });
      addAuditLog(user.uid, user.fullName, 'ADMIN_FORCE_RESOLVE', { issueId, title });
      loadAdminData();
      alert(`Issue "${title}" resolved.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete issue permanently
  const handleDeleteIssue = (issueId, title) => {
    const conf = window.confirm(`DANGER: Are you sure you want to PERMANENTLY DELETE issue "${title}"? This cannot be undone.`);
    if (!conf) return;

    try {
      deleteIssueFromDB(issueId);
      addAuditLog(user.uid, user.fullName, 'ADMIN_DELETE_ISSUE', { issueId, title });
      loadAdminData();
      alert(`Issue "${title}" deleted.`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5.5 h-5.5 text-rose-500" />
            <span>Admin Control Center</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">Manage user privileges, review AI-flagged fraud/spam reports, override filters, and audit system activities.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-900 space-x-6 text-sm font-semibold overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'users' ? 'border-b-2 border-emerald-500 text-white' : 'text-zinc-550 hover:text-zinc-300'
            }`}
          >
            User Accounts
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'issues' ? 'border-b-2 border-emerald-500 text-white' : 'text-zinc-550 hover:text-zinc-300'
            }`}
          >
            All Infrastructure Reports
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'fraud' ? 'border-b-2 border-emerald-500 text-white' : 'text-zinc-550 hover:text-zinc-300'
            }`}
          >
            AI Fraud & Flags
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'border-b-2 border-emerald-500 text-white' : 'text-zinc-550 hover:text-zinc-300'
            }`}
          >
            System Security Audits
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <span className="text-xs text-zinc-550 mt-2 block">Syncing administrative records...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. User Management Tab */}
            {activeTab === 'users' && (
              <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-850 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-550 font-bold uppercase tracking-wider">
                  <span>Name & Email</span>
                  <div className="flex space-x-10 items-center">
                    <span className="w-20 text-center">XP Level</span>
                    <span className="w-24 text-center">Trust Score</span>
                    <span className="w-28 text-center">System Role</span>
                    <span className="w-20 text-right">Actions</span>
                  </div>
                </div>

                <div className="divide-y divide-zinc-850">
                  {usersList.map((targetUser) => (
                    <div key={targetUser.uid} className="p-4 flex items-center justify-between text-xs text-zinc-350">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={targetUser.avatarUrl} 
                          alt={targetUser.fullName} 
                          className="w-8 h-8 rounded-full border border-zinc-800"
                        />
                        <div>
                          <strong className="text-zinc-200 block font-bold">{targetUser.fullName}</strong>
                          <span className="text-[10px] text-zinc-550 font-mono block">{targetUser.email}</span>
                        </div>
                      </div>

                      <div className="flex space-x-10 items-center">
                        <span className="w-20 text-center text-zinc-400 font-bold">Lvl {targetUser.level || 1}</span>
                        <span className="w-24 text-center text-indigo-400 font-mono font-bold">{targetUser.trustScore || 70}%</span>
                        
                        <div className="w-28">
                          <select
                            value={targetUser.role}
                            onChange={(e) => handleRoleChange(targetUser.uid, e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300 w-full focus:outline-none"
                          >
                            <option value="citizen">Citizen</option>
                            <option value="official">Official</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div className="w-20 flex justify-end">
                          <button
                            onClick={() => handleBanUser(targetUser.uid, targetUser.fullName)}
                            className="p-1.5 text-zinc-650 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Restrict account"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Global Issues Override Tab */}
            {activeTab === 'issues' && (
              <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-850 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-550 font-bold uppercase tracking-wider">
                  <span>Issue Description & Address</span>
                  <div className="flex space-x-10 items-center">
                    <span className="w-24 text-center">Category</span>
                    <span className="w-28 text-center">Status</span>
                    <span className="w-24 text-right">Actions Override</span>
                  </div>
                </div>

                <div className="divide-y divide-zinc-850">
                  {issuesList.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-xs italic">
                      No infrastructure complaints logged.
                    </div>
                  ) : (
                    issuesList.map((issue) => (
                      <div key={issue.id} className="p-4 flex items-center justify-between text-xs text-zinc-300 hover:bg-zinc-900/5">
                        <div className="flex items-center space-x-3 truncate max-w-[400px]">
                          <img 
                            src={issue.imageUrl || 'https://images.unsplash.com/photo-1599740831146-80e6f87ad60b?auto=format&fit=crop&w=800&q=80'} 
                            alt={issue.title} 
                            className="w-10 h-10 object-cover rounded-lg border border-zinc-850 shrink-0"
                          />
                          <div className="truncate">
                            <strong className="text-zinc-200 block truncate font-bold">{issue.title}</strong>
                            <span className="text-[10px] text-zinc-555 block truncate" suppressHydrationWarning>
                              📍 {issue.address} • {new Date(issue.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-10 items-center">
                          <span className="w-24 text-center text-zinc-400 capitalize">{issue.category}</span>
                          
                          <span className={`w-28 text-center font-bold px-2 py-0.5 rounded border capitalize text-[10px] ${
                            issue.status === 'resolved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : issue.status === 'in_progress'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : 'bg-zinc-900 text-zinc-450 border-zinc-800'
                          }`}>
                            {issue.status.replace('_', ' ')}
                          </span>

                          <div className="w-24 flex justify-end space-x-2">
                            {issue.status !== 'resolved' && (
                              <button
                                onClick={() => handleForceResolve(issue.id, issue.title)}
                                className="p-1.5 text-zinc-550 hover:text-emerald-450 hover:bg-emerald-500/10 rounded transition-colors"
                                title="Force Resolve"
                                aria-label={`Force resolve issue: ${issue.title}`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteIssue(issue.id, issue.title)}
                              className="p-1.5 text-zinc-550 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                              title="Delete permanently"
                              aria-label={`Permanently delete issue: ${issue.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. AI Flags Review Tab */}
            {activeTab === 'fraud' && (
              <div className="space-y-4">
                {fraudIssues.length === 0 ? (
                  <div className="glass-panel p-8 rounded-2xl border border-zinc-800 text-center text-zinc-500 text-xs italic">
                    All clear! No issues currently flagged for review by Gemini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {fraudIssues.map((issue) => (
                      <div key={issue.id} className="glass-panel p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={issue.imageUrl || 'https://images.unsplash.com/photo-1599740831146-80e6f87ad60b?auto=format&fit=crop&w=800&q=80'} 
                            alt={issue.title} 
                            className="w-16 h-16 object-cover rounded-xl border border-zinc-850 shrink-0"
                          />
                          <div className="space-y-1">
                            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              <span>AI Flagged (Confidence: {Math.round(issue.aiConfidence * 100)}%)</span>
                            </span>
                            <h3 className="text-sm font-bold text-zinc-200">{issue.title}</h3>
                            <p className="text-xs text-zinc-400 max-w-md line-clamp-1">{issue.description}</p>
                            <span className="text-[10px] text-zinc-550 block font-mono">📍 {issue.address}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2 self-end md:self-center">
                          <button
                            onClick={() => handleOverrideApprove(issue.id, issue.title)}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-lg transition-all"
                          >
                            Override & Verify
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue.id, issue.title)}
                            className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 font-bold text-xs rounded-lg transition-all"
                          >
                            Delete Report
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Security Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-850 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-550 font-bold uppercase tracking-wider">
                  <span>Authorized Operator</span>
                  <div className="flex space-x-12 items-center">
                    <span className="w-48 text-left">Action Triggered</span>
                    <span className="w-64 text-left">Details Payload</span>
                  </div>
                </div>

                <div className="divide-y divide-zinc-850 font-mono text-[10.5px]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 flex items-center justify-between text-zinc-400">
                      <div>
                        <span className="text-[9px] text-zinc-600 block" suppressHydrationWarning>{new Date(log.createdAt).toLocaleString()}</span>
                        <strong className="text-zinc-300 block">{log.userName}</strong>
                      </div>

                      <div className="flex space-x-12 items-center">
                        <span className="w-48 text-left font-bold text-emerald-400">{log.action}</span>
                        <span className="w-64 text-left text-zinc-500 truncate" title={JSON.stringify(log.details)}>
                          {JSON.stringify(log.details)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-550 text-xs">Loading Admin Panel...</span>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
