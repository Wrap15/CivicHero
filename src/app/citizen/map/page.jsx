'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import MapView from '@/components/shared/MapView';
import { useAuth } from '@/hooks/useAuth';
import { issueService } from '@/services/issueService';
import { 
  Filter, 
  Layers, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Info,
  SlidersHorizontal,
  FlameKindling
} from 'lucide-react';

export default function CitizenMapPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Data states
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showHeatmap, setShowHeatmap] = useState(false);

  const categories = [
    'All', 'Road Damage', 'Water Leakage', 'Streetlight', 'Garbage', 
    'Electric Hazard', 'Illegal Construction', 'Public Safety', 
    'Tree Fall', 'Drainage', 'Others'
  ];

  const statuses = [
    { value: 'All', label: 'All Statuses' },
    { value: 'reported', label: 'Reported' },
    { value: 'citizen_verified', label: 'Citizen Verified' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
  ];

  // Protect route
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load issues
  useEffect(() => {
    const loadData = async () => {
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
    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = issues;

    if (selectedCategory !== 'All') {
      result = result.filter(i => i.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      result = result.filter(i => i.status === selectedStatus);
    }

    setFilteredIssues(result);
  }, [selectedCategory, selectedStatus, issues]);

  // Calc stats
  const activeCount = issues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const criticalCount = issues.filter(i => i.severity === 'critical' || i.severity === 'high').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Filter and Stats Panel */}
        <div className="w-full md:w-80 shrink-0 space-y-6">
          
          <div>
            <h1 className="text-xl font-extrabold text-white">Live Infrastructure Map</h1>
            <p className="text-zinc-500 text-xs mt-1">Explore current problems logged and verified by the community.</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 text-center">
              <span className="block text-lg font-black text-white">{issues.length}</span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Total</span>
            </div>
            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-center">
              <span className="block text-lg font-black text-emerald-400">{resolvedCount}</span>
              <span className="text-[8px] text-emerald-500/70 font-bold uppercase tracking-wider">Resolved</span>
            </div>
            <div className="bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 text-center">
              <span className="block text-lg font-black text-rose-400">{criticalCount}</span>
              <span className="text-[8px] text-rose-500/70 font-bold uppercase tracking-wider">Urgent</span>
            </div>
          </div>

          {/* Filter Form Card */}
          <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-4">
            
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5 border-b border-zinc-850 pb-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Map Filters</span>
            </h3>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-zinc-500">Problem Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-zinc-500">Work Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Heatmap Toggle */}
            <div className="pt-2 border-t border-zinc-850">
              <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-850">
                <div className="flex items-center space-x-2">
                  <FlameKindling className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="block text-xs font-semibold text-zinc-200">Severity Heatmap</span>
                    <span className="block text-[9px] text-zinc-500">Identify dense threat zones</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="w-4.5 h-4.5 accent-rose-500 bg-zinc-950 border-zinc-800 rounded"
                />
              </div>
            </div>

          </div>

          {/* Color Key Info */}
          <div className="glass-panel p-4 rounded-xl border border-zinc-850 text-xs space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Status Pin Legend</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block shrink-0" />
                <span className="text-zinc-400">Reported</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block shrink-0" />
                <span className="text-zinc-400">Verified</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block shrink-0" />
                <span className="text-zinc-400">Assigned</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block shrink-0" />
                <span className="text-zinc-400">In Progress</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shrink-0" />
                <span className="text-zinc-400">Resolved</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Map Canvas Panel */}
        <div className="flex-1 bg-zinc-900/20 rounded-2xl border border-zinc-850 p-3 h-[450px] md:h-[calc(100vh-160px)] relative overflow-hidden">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-zinc-500 text-xs font-medium">Drawing map overlay...</span>
              </div>
            </div>
          ) : (
            <MapView 
              issues={filteredIssues} 
              showHeatmap={showHeatmap}
              zoom={13}
            />
          )}
        </div>

      </main>
    </div>
  );
}
