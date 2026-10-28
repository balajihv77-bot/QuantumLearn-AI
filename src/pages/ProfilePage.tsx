import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, School, Shield, Award, Check, Settings, FileDown, Sparkles, LogOut } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button3D } from '../components/common/Button3D';
import { DEMO_USER_PROFILE } from '../data/demoData';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();

  const [notationFormat, setNotationFormat] = useState<'dirac' | 'matrix'>('dirac');
  const [defaultShots, setDefaultShots] = useState<number>(1024);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const displayName = user?.full_name || user?.username || DEMO_USER_PROFILE.name;
  const displayEmail = user?.email || DEMO_USER_PROFILE.email;
  const displayInstitution = user?.institution || DEMO_USER_PROFILE.institution;
  const displayRole = user?.role || DEMO_USER_PROFILE.role;
  const displayXp = user?.xp || DEMO_USER_PROFILE.xpPoints;
  const displayLevel = user?.level || DEMO_USER_PROFILE.level;
  const displayStreak = user?.streak_days || DEMO_USER_PROFILE.streakDays;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExport = () => {
    setExportNotice('Academic transcript exported successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Account Credentials</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Student Profile & Settings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your academic identity, quantum simulation preferences, and course credentials.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Profile Card */}
        <GlassCard glow className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-2xl font-bold font-outfit shadow-lg shadow-cyan-500/20 shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  {isAuthenticated && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/40">
                      Active Session
                    </span>
                  )}
                </div>
                <p className="text-sm text-cyan-400 font-medium">{displayRole}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {displayEmail}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-slate-500" />
                    {displayInstitution}
                  </span>
                </div>
              </div>
            </div>

            {/* In-Card Session Status */}
            {!isAuthenticated && (
              <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={loginAsDemo}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Restore Demo Session</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">XP Points</span>
              <span className="font-mono text-xl font-bold text-cyan-300 tabular-nums">{displayXp}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Scholar Level</span>
              <span className="font-mono text-xl font-bold text-purple-300 tabular-nums">Level {displayLevel}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Streak</span>
              <span className="font-mono text-xl font-bold text-amber-300 tabular-nums">{displayStreak} Days</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Circuits Built</span>
              <span className="font-mono text-xl font-bold text-emerald-300 tabular-nums">{DEMO_USER_PROFILE.circuitsSimulated}</span>
            </div>
          </div>
        </GlassCard>

        {/* Quantum Simulation Preferences */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workbench Simulation Preferences</h3>
          </div>

          {/* Notation format toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Default Quantum Mathematical Notation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNotationFormat('dirac')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  notationFormat === 'dirac'
                    ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">Dirac Bra-Ket Notation</div>
                <div className="text-xs font-mono text-cyan-300 mt-1">|ψ⟩ = α|0⟩ + β|1⟩</div>
              </button>

              <button
                type="button"
                onClick={() => setNotationFormat('matrix')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  notationFormat === 'matrix'
                    ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">Vector Column Matrix Notation</div>
                <div className="text-xs font-mono text-cyan-300 mt-1">[α, β]ᵀ (2x1 Column)</div>
              </button>
            </div>
          </div>

          {/* Default shots count */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Default Simulator Shots Count
            </label>
            <div className="flex flex-wrap gap-3">
              {[1024, 2048, 4096, 8192].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setDefaultShots(count)}
                  className={`px-4 py-2 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer ${
                    defaultShots === count
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {count} shots
                </button>
              ))}
            </div>
          </div>

          {/* Export notification */}
          {exportNotice && (
            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              <span>{exportNotice}</span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <Button3D
              variant="cyan"
              size="md"
              onClick={handleSave}
              leftIcon={isSaved ? <Check className="w-4 h-4" /> : undefined}
            >
              {isSaved ? 'Preferences Saved!' : 'Save Profile Preferences'}
            </Button3D>

            <div className="flex flex-col sm:items-end gap-2.5 w-full sm:w-auto">
              <Button3D
                variant="dark"
                size="md"
                onClick={handleExport}
                leftIcon={<FileDown className="w-4 h-4 text-cyan-400" />}
                className="w-full sm:w-auto justify-center"
              >
                Export Learning Transcript
              </Button3D>

              {/* Log Out button positioned directly below Export Learning Transcript */}
              <Button3D
                variant="dark"
                size="md"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-4 h-4 text-rose-400" />}
                className="w-full sm:w-auto justify-center hover:border-rose-500/50 hover:text-rose-300 text-slate-200"
                title="Log Out of your account"
              >
                Log Out
              </Button3D>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
