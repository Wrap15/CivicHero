'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building2, 
  Users, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function DepartmentsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Protect route
  useEffect(() => {
    if (!user || user.role !== 'official') {
      router.push('/');
    }
  }, [user, router]);

  // Mock department statistics
  const departments = [
    {
      id: 'dep_1',
      name: 'Roads & Traffic',
      description: 'Maintains street surfaces, asphalt sealing, traffic lights, and street signs.',
      manager: 'Director Sarah Jenkins',
      workers: 24,
      pendingCount: 8,
      avgResolutionDays: 3.2,
      efficiency: '92%'
    },
    {
      id: 'dep_2',
      name: 'Sanitation & Waste',
      description: 'Handles garbage overflows, hazardous chemical spills, and community dumping.',
      manager: 'Superintendent Rogers',
      workers: 18,
      pendingCount: 3,
      avgResolutionDays: 1.1,
      efficiency: '96%'
    },
    {
      id: 'dep_3',
      name: 'Water & Sewage Board',
      description: 'Manages municipal pipes, water leakage complaints, and sewer lines.',
      manager: 'Chief Engineer Chen',
      workers: 15,
      pendingCount: 5,
      avgResolutionDays: 2.4,
      efficiency: '88%'
    },
    {
      id: 'dep_4',
      name: 'Power & Grid Systems',
      description: 'Oversees public streetlights, fallen high-voltage cables, and electric hazards.',
      manager: 'Supervisor Miller',
      workers: 12,
      pendingCount: 2,
      avgResolutionDays: 1.5,
      efficiency: '94%'
    },
    {
      id: 'dep_5',
      name: 'Parks & Public Safety',
      description: 'Coordinates tree fall clearing, park safety, and animal hazard controls.',
      manager: 'Warden Davis',
      workers: 10,
      pendingCount: 4,
      avgResolutionDays: 2.1,
      efficiency: '91%'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Building2 className="w-5.5 h-5.5 text-emerald-400" />
            <span>Municipal Departments Directory</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Review organizational metrics, team rosters, and dispatch response performance.</p>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="glass-panel p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-white leading-snug">{dept.name}</h3>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded">
                    {dept.efficiency} Score
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{dept.description}</p>
              </div>

              {/* Roster & Queue Stats */}
              <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">Workers</span>
                  <strong className="text-zinc-200 block mt-0.5">{dept.workers}</strong>
                </div>
                <div className="border-l border-zinc-850">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">Backlog</span>
                  <strong className="text-rose-400 block mt-0.5">{dept.pendingCount}</strong>
                </div>
                <div className="border-l border-zinc-850">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">Avg Resolution</span>
                  <strong className="text-emerald-400 block mt-0.5">{dept.avgResolutionDays}d</strong>
                </div>
              </div>

              {/* Manager metadata */}
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-900">
                <span>Manager: <strong className="text-zinc-300 font-medium">{dept.manager}</strong></span>
                <button className="flex items-center space-x-0.5 hover:text-emerald-400 transition-colors">
                  <span>Manage Roster</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
