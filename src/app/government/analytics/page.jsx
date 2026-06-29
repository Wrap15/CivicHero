'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { issueService } from '@/services/issueService';
import { aiService } from '@/services/aiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Layers,
  Clock,
  Loader2
} from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Data states
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  // Dynamic Chart States
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  // Protect route
  useEffect(() => {
    if (!user || user.role !== 'official') {
      router.push('/');
    }
  }, [user, router]);

  // Load issues and compute stats
  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await issueService.getAllIssues();
        setIssues(list);
        
        // 1. Group by category
        const catMap = {};
        list.forEach((i) => {
          catMap[i.category] = (catMap[i.category] || 0) + 1;
        });
        const catArray = Object.keys(catMap).map(cat => ({
          name: cat,
          volume: catMap[cat]
        }));
        setCategoryData(catArray);

        // 2. Group by status
        const statMap = {};
        list.forEach((i) => {
          const formatted = i.status.replace('_', ' ');
          statMap[formatted] = (statMap[formatted] || 0) + 1;
        });
        const statArray = Object.keys(statMap).map(status => ({
          name: status,
          value: statMap[status]
        }));
        setStatusData(statArray);

        // 3. Fetch AI Predictions
        setLoadingPredictions(true);
        const forecast = await aiService.getPredictiveRisk(list);
        setPredictions(forecast);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingPredictions(false);
      }
    };
    loadData();
  }, []);

  // Static historical trends
  const trendData = [
    { month: 'Jan', reports: 120, resolutions: 110 },
    { month: 'Feb', reports: 140, resolutions: 135 },
    { month: 'Mar', reports: 190, resolutions: 170 },
    { month: 'Apr', reports: 220, resolutions: 200 },
    { month: 'May', reports: 270, resolutions: 240 },
    { month: 'Jun', reports: 310, resolutions: 290 },
  ];

  const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#eab308', '#dc2626', '#6b7280'];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-8">
        
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <BarChart3 className="w-5.5 h-5.5 text-emerald-400" />
            <span>Civic Insights & Analytics</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Monitor real-time ticket performance and review Gemini AI predictive infrastructure risks.</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <span className="text-xs text-zinc-500 mt-2 block">Calculating report metrics...</span>
          </div>
        ) : (
          <>
            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Volume Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Defects by Category</span>
                </h3>
                <div className="w-full h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} 
                        labelStyle={{ color: '#f4f4f5', fontWeight: 'bold', fontSize: '10px' }}
                        itemStyle={{ color: '#10b981', fontSize: '11px' }}
                      />
                      <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly intake trends */}
              <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>6-Month Ingestion vs Resolution</span>
                </h3>
                <div className="w-full h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <XAxis dataKey="month" stroke="#52525b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} 
                        labelStyle={{ color: '#f4f4f5', fontSize: '10px' }}
                        itemStyle={{ fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="reports" stroke="#ef4444" fill="rgba(239, 68, 68, 0.05)" />
                      <Area type="monotone" dataKey="resolutions" stroke="#10b981" fill="rgba(16, 185, 129, 0.05)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Pie Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Ticket Status Distribution</span>
                </h3>
                <div className="w-full h-60 flex flex-col md:flex-row items-center justify-around gap-4">
                  <div className="w-44 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {statusData.map((stat, idx) => (
                      <div key={stat.name} className="flex items-center space-x-2 text-[10px]">
                        <span 
                          className="w-2.5 h-2.5 rounded-full block shrink-0" 
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                        />
                        <span className="text-zinc-400 capitalize">{stat.name}:</span>
                        <strong className="text-zinc-200">{stat.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Predictive analysis panel */}
              <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                    <span>Gemini AI Predictive Risk Forecast</span>
                  </h3>
                  <p className="text-[10px] text-zinc-550 mt-1">AI modeling scan derived from historical complaint clusters and weather forecasts.</p>
                </div>

                {loadingPredictions ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                    <span className="text-[10px] text-zinc-550 mt-1 block">Querying forecasting engine...</span>
                  </div>
                ) : predictions ? (
                  <div className="space-y-4 text-xs text-zinc-300">
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                      <span className="text-[9px] uppercase font-bold text-zinc-550 block">Predicted Pothole Hotspot</span>
                      <strong className="text-zinc-200 block mt-0.5">{predictions.potholeRisks[0]?.area || 'Broadway Corridor'}</strong>
                      <p className="text-[10px] text-zinc-400 mt-1 font-mono">{predictions.potholeRisks[0]?.explanation}</p>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                      <span className="text-[9px] uppercase font-bold text-zinc-550 block">Sanitation Overload Forecast</span>
                      <strong className="text-zinc-200 block mt-0.5">{predictions.garbageHotspots[0]?.area || 'Central Park Entrance'}</strong>
                      <p className="text-[10px] text-zinc-400 mt-1 font-mono">Peak hour warning: {predictions.garbageHotspots[0]?.peakTime}</p>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                      <span className="text-[9px] uppercase font-bold text-zinc-550 block">Seasonal Complaint Trends</span>
                      <p className="text-[10.5px] text-zinc-400 mt-1 italic leading-relaxed">"{predictions.seasonalTrends}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-550 italic text-center py-6">
                    Predictions unavailable. Add more complaints to train models.
                  </div>
                )}
              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}
