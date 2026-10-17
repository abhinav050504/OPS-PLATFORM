import React from 'react';
import { useOps } from '../context/OpsContext';
import { INITIAL_USERS, TEAMS } from '../mock/initialData';
import { ShieldCheck, Plus, Users, Layers } from 'lucide-react';

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
        <div className="flex items-center justify-between h-14">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">NEWTONITE</span>
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                  OPS HUB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Operations Under Pressure Coordination System</p>
            </div>
          </div>

          {/* Right Controls: Team Filter, User Switcher (RBAC), and New Item Button */}
          <div className="flex items-center gap-2.5">
            
            {/* Team Filter */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 rounded-lg px-2.5 py-1.5 border border-slate-700/80 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Filter work items by team"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                {TEAMS.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-slate-200">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Persona Switcher (RBAC Demonstrator) */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-lg px-2.5 py-1.5 border border-slate-700/80 text-xs">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                  Test Role (RBAC)
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
                      {u.name} — {u.role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* New Work Item Button */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Work Item</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
