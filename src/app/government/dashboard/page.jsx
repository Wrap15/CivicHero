'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { issueService } from '@/services/issueService';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  UserCheck, 
  Calendar,
  Send,
  Loader2,
  FileImage,
  Inbox
} from 'lucide-react';

export default function GovernmentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // Data states
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [votes, setVotes] = useState([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Input states
  const [workerName, setWorkerName] = useState('');
  const [statusChange, setStatusChange] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionPhotoPreview, setResolutionPhotoPreview] = useState('');

  // Status states
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Protect route
  useEffect(() => {
    if (!user || user.role !== 'official') {
      router.push('/');
    }
  }, [user, router]);

  // Load issues
  const loadIssues = async () => {
    try {
      const data = await issueService.getAllIssues();
      setIssues(data);
      setFilteredIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  // Load issue details
  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedIssueId) {
        setSelectedIssue(null);
        return;
      }
      const iss = issues.find(i => i.id === selectedIssueId);
      setSelectedIssue(iss);
      if (iss) {
        setStatusChange(iss.status);
        const vts = await issueService.getVotes(selectedIssueId);
        setVotes(vts);
      }
    };
    loadDetails();
  }, [selectedIssueId, issues]);

  // Apply filters
  useEffect(() => {
    let result = issues;
    
    if (statusFilter !== 'All') {
      result = result.filter(i => i.status === statusFilter);
    }
    
    if (severityFilter !== 'All') {
      result = result.filter(i => i.severity === severityFilter);
    }
    
    setFilteredIssues(result);
  }, [statusFilter, severityFilter, issues]);

  // Handle resolution photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolutionPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setResolutionPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit status update / resolution details
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setUpdating(true);

    try {
      let resolutionUrl = '';
      if (statusChange === 'resolved' && resolutionPhoto) {
        // Upload photo
        resolutionUrl = await issueService.uploadFile(resolutionPhoto, 'resolutions');
      } else if (statusChange === 'resolved' && resolutionPhotoPreview) {
        resolutionUrl = resolutionPhotoPreview;
      }

      await issueService.updateIssueStatus(
        selectedIssue.id, 
        statusChange, 
        resolutionNotes, 
        resolutionUrl, 
        'worker_placeholder', 
        workerName
      );

      // Clean form inputs
      setWorkerName('');
      setResolutionNotes('');
      setResolutionPhoto(null);
      setResolutionPhotoPreview('');

      // Reload issues
      await loadIssues();
      
      alert(`Issue status successfully updated to: ${statusChange}`);
    } catch (err) {
      console.error(err);
      alert('Failed to update issue status.');
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Department queue filter & list (col 5) */}
        <div className={`lg:col-span-5 flex flex-col space-y-4 ${selectedIssueId ? 'hidden lg:flex' : 'flex'}`}>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <Building2 className="w-5.5 h-5.5 text-emerald-400" />
              <span>Municipal Work Queue</span>
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">Manage tasks in your sector, check consensus, and coordinate repairs.</p>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-2 gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-850">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
              >
                <option value="All">All statuses</option>
                <option value="reported">Reported</option>
                <option value="citizen_verified">Citizen Verified</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500">Severity</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
              >
                <option value="All">All levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Ticket Queue List */}
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1.5">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                <span className="text-xs text-zinc-500 mt-2 block">Loading dispatch database...</span>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-16 border border-zinc-850 border-dashed rounded-2xl bg-zinc-900/[0.05]">
                <Inbox className="w-8 h-8 text-zinc-650 mx-auto mb-2" />
                <span className="block text-xs font-bold text-zinc-400">Queue is clear!</span>
                <span className="block text-[10px] text-zinc-550 mt-1">No pending tickets match current filters.</span>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedIssueId === issue.id 
                      ? 'bg-zinc-900 border-emerald-500/30' 
                      : 'bg-zinc-900/30 border-zinc-850 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-black text-emerald-400">{issue.category}</span>
                    <div className="flex space-x-1.5">
                      <span className={`text-[8.5px] px-2 py-0.5 rounded-full border capitalize font-bold ${getSeverityBadge(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className="text-[8.5px] px-2 py-0.5 bg-zinc-950 rounded border border-zinc-800 text-zinc-400 capitalize">
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="text-xs font-bold text-white mt-2 truncate">{issue.title}</h4>
                  
                  <div className="flex items-center justify-between mt-3 text-[9px] text-zinc-500">
                    <span className="truncate max-w-[200px]">📍 {issue.address}</span>
                    <span suppressHydrationWarning>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>

        </div>

        {/* Right: Resolution Control Panel (col 7) */}
        <div className={`lg:col-span-7 ${selectedIssueId ? 'block' : 'hidden lg:block'}`}>
          {selectedIssue ? (
            <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-6 max-h-[800px] overflow-y-auto pr-2">
              
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedIssueId(null)}
                className="lg:hidden flex items-center space-x-1.5 text-xs text-emerald-450 font-bold mb-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-850"
              >
                <span>← Back to Queue</span>
              </button>

              {/* Info Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                    {selectedIssue.category}
                  </span>
                  
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold capitalize ${getSeverityBadge(selectedIssue.severity)}`}>
                    {selectedIssue.severity} Priority
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white">{selectedIssue.title}</h2>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">📍 Location: {selectedIssue.address}</p>
              </div>

              {/* Photo Inspect */}
              <div className="w-full h-44 rounded-xl overflow-hidden border border-zinc-850">
                <img 
                  src={selectedIssue.imageUrl || 'https://images.unsplash.com/photo-1599740831146-80e6f87ad60b?auto=format&fit=crop&w=800&q=80'} 
                  alt={selectedIssue.title} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Description summary */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
                <span className="block text-[9px] uppercase font-bold text-zinc-500">Inspector Intake Notes</span>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedIssue.description}</p>
              </div>

              {/* Citizen Votes Consensus */}
              <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-850 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-white">Community Verification Ratio</span>
                  <span className="block text-[10px] text-zinc-500">Votes cast by local residents to confirm ticket validity.</span>
                </div>
                <div className="flex space-x-3 text-xs text-center">
                  <div className="bg-emerald-500/5 px-2.5 py-1.5 rounded border border-emerald-500/10">
                    <span className="block font-black text-emerald-400">{votes.filter(v => v.vote === 'confirm').length}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">Yes</span>
                  </div>
                  <div className="bg-rose-500/5 px-2.5 py-1.5 rounded border border-rose-500/10">
                    <span className="block font-black text-rose-400">{votes.filter(v => v.vote === 'reject').length}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">No</span>
                  </div>
                </div>
              </div>

              {/* Resolution Action Card */}
              <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-850 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Update Task Status</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Assign dispatch workers, update status, and close tickets once resolved.</p>
                </div>

                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Action Status</label>
                      <select
                        value={statusChange}
                        onChange={(e) => setStatusChange(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                      >
                        <option value="reported">Reported</option>
                        <option value="assigned">Assign Department</option>
                        <option value="in_progress">Mark In Progress</option>
                        <option value="resolved">Mark Resolved / Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Assign Maintenance Team</label>
                      <input
                        type="text"
                        value={workerName}
                        onChange={(e) => setWorkerName(e.target.value)}
                        placeholder="e.g. Sanitation Team Alpha"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-700"
                      />
                    </div>
                  </div>

                  {statusChange === 'resolved' && (
                    <div className="space-y-4 pt-2 border-t border-zinc-900">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Resolution Notes</label>
                        <textarea
                          required
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          rows={3}
                          placeholder="Describe the repairs made, equipment used, and final safety status..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-700"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex items-center justify-center text-center">
                          <label className="flex flex-col items-center justify-center cursor-pointer">
                            <FileImage className="w-6 h-6 text-zinc-500 mb-1" />
                            <span className="text-[10px] text-zinc-400 font-bold">Proof of Repair Photo</span>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                          </label>
                        </div>

                        {resolutionPhotoPreview && (
                          <div className="w-full h-24 rounded-lg overflow-hidden border border-zinc-800">
                            <img src={resolutionPhotoPreview} alt="Resolution preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating municipal logs...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply Status Updates</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="h-[450px] border border-dashed border-zinc-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-zinc-900/[0.05]">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 mb-3">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-zinc-300">Select pending ticket</h3>
              <p className="text-[11px] text-zinc-550 mt-1 max-w-xs leading-normal">
                Open tickets in the queue to coordinate repairs, confirm community consensus reports, and upload resolution proof logs.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
