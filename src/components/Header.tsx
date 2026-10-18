import React from 'react';
import { useOps } from '../context/OpsContext';
import { INITIAL_USERS, TEAMS } from '../mock/initialData';
import { ShieldCheck, Plus, Users, Layers, Server, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateModal }) => {
  const {
    currentUser,
    setCurrentUser,
    selectedTeam,
    setSelectedTeam,
    backendOnline,
    refreshFromBackend,
  } = useOps();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand & Backend Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-900">NEWTONITE</span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  OPS HUB
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">Operations Coordination Platform</p>
            </div>

            {/* Backend Connection Indicator Badge */}
            <button
              onClick={() => refreshFromBackend()}
              title="Click to re-ping backend service status"
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                backendOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <Server className="w-3 h-3 text-current" />
              <span>{backendOnline ? 'Backend API: Live (Port 3000)' : 'Backend API: Standby (Local OCC)'}</span>
              <RefreshCw className="w-2.5 h-2.5 opacity-60 ml-0.5" />
            </button>
          </div>

          {/* Right Controls: Team Filter, User Switcher (RBAC), and New Item Button */}
          <div className="flex items-center gap-2.5">
            {/* Team Filter */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <select
                aria-label="Filter work items by team"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer"
              >
                {TEAMS.map((t) => (
                  <option key={t} value={t} className="bg-white text-slate-800">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Persona Switcher (RBAC Demonstrator) */}
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                  Test Role (RBAC)
                </span>
                <select
                  aria-label="Switch test user persona for RBAC testing"
                  value={currentUser.id}
                  onChange={(e) => {
                    const u = INITIAL_USERS.find((x) => x.id === e.target.value);
                    if (u) setCurrentUser(u);
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {INITIAL_USERS.map((u) => (
                    <option key={u.id} value={u.id} className="bg-white text-slate-800">
                      {u.name} — {u.role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* New Work Item Button */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
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
