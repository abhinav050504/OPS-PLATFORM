import React from 'react';
import { useOps } from '../context/OpsContext';
import { INITIAL_USERS, TEAMS } from '../mock/initialData';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  Layers, 
  PlusCircle, 
  Radio, 
  Sparkles 
} from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateModal }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    selectedTeam, 
    setSelectedTeam 
  } = useOps();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-white">NEWTONITE</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  OPS HUB
                </span>
              </div>
              <p className="text-xs text-slate-400">Operations Under Pressure • Live Coordination</p>
            </div>
          </div>

          {/* Center: Live Sync Telemetry */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Socket Live</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">12ms latency</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-mono">Consensus v4.8</span>
          </div>

          {/* Right Controls: Team Filter, User Switcher (RBAC), and Create Button */}
          <div className="flex items-center gap-3">
            
            {/* Team Filter */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 rounded-lg px-2.5 py-1.5 border border-slate-700/60 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Filter work items by team"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
              >
                {TEAMS.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-slate-200">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Persona Switcher (RBAC Demonstrator) */}
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-lg px-2.5 py-1.5 border border-slate-700/60">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Test Persona (RBAC)
                </span>
                <select
                  aria-label="Switch test user persona for RBAC testing"
                  value={currentUser.id}
                  onChange={(e) => {
                    const u = INITIAL_USERS.find((x) => x.id === e.target.value);
                    if (u) setCurrentUser(u);
                  }}
                  className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
                >
                  {INITIAL_USERS.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                      {u.name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* New Work Item Button */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Work Item</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
