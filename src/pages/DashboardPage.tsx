import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Award, BookOpen, Clock, Cpu, Play, CheckCircle2, ArrowRight, Compass, Shield } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button3D } from '../components/common/Button3D';
import { DEMO_USER_PROFILE, DEMO_MODULES, DEMO_ALGORITHMS } from '../data/demoData';
import { progressService } from '../services/progressService';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const user = authUser ? {
    name: authUser.full_name || authUser.username,
    email: authUser.email,
    institution: authUser.institution || DEMO_USER_PROFILE.institution,
    role: authUser.role || DEMO_USER_PROFILE.role,
    xpPoints: authUser.xp ?? DEMO_USER_PROFILE.xpPoints,
    level: authUser.level ?? DEMO_USER_PROFILE.level,
    streakDays: authUser.streak_days ?? DEMO_USER_PROFILE.streakDays,
    circuitsSimulated: DEMO_USER_PROFILE.circuitsSimulated,
    badges: DEMO_USER_PROFILE.badges
  } : DEMO_USER_PROFILE;

  const [stats, setStats] = useState(() => progressService.getProgressStats(DEMO_MODULES.length));

  useEffect(() => {
    const update = () => setStats(progressService.getProgressStats(DEMO_MODULES.length));
    update();
    return progressService.subscribe(update);
  }, []);

  const completedIds = progressService.getCompletedModuleIds();
  // Find first incomplete module, or default to module 1
  const activeModule = DEMO_MODULES.find((m) => !completedIds.includes(m.id)) || DEMO_MODULES[0];

  // Weekly study data
  const weeklyActivity = [
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 2.0 },
    { day: 'Wed', hours: 0.8 },
    { day: 'Thu', hours: 2.5 },
    { day: 'Fri', hours: 1.2 },
    { day: 'Sat', hours: 3.0 },
    { day: 'Sun', hours: 1.8 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Student Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Academic Portal</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Student Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {user.name} · {user.role} at {user.institution}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button3D
            variant="cyan"
            size="md"
            onClick={() => navigate('/lab')}
            leftIcon={<Cpu className="w-4 h-4" />}
          >
            Launch Circuit Workbench
          </Button3D>

          <Button3D
            variant="purple"
            size="md"
            onClick={() => navigate('/simulator')}
            leftIcon={<Compass className="w-4 h-4 text-purple-300" />}
          >
            3D Bloch Sandbox
          </Button3D>
        </div>
      </div>

      {/* Numerical KPI Row (with tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
            <Flame className="w-4 h-4" />
            <span>Learning Streak</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {stats.streak} <span className="text-xs font-sans text-slate-400 font-normal">days active</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Completed Modules</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300 tabular-nums">
            {stats.completedCount} <span className="text-xs font-sans text-slate-400 font-normal">/ {DEMO_MODULES.length}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold mb-1">
            <Cpu className="w-4 h-4" />
            <span>Circuits Tested</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-300 tabular-nums">
            {user.circuitsSimulated}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
            <Shield className="w-4 h-4" />
            <span>Scholar XP</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-300 tabular-nums">
            {stats.xp} <span className="text-xs font-sans text-slate-400 font-normal">XP</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Active Track & Weekly Time (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active In-Progress Module */}
          <GlassCard glow className="p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Continue Where You Left Off</div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{activeModule.title}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">{activeModule.description}</p>
              </div>

              <Button3D
                variant="cyan"
                size="md"
                onClick={() => navigate(`/modules?selected=${activeModule.slug}`)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                Resume Lesson
              </Button3D>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Status: {progressService.isModuleCompleted(activeModule.id) ? 'Completed' : 'Ready to Start'}</span>
                <span className="font-mono text-cyan-300 tabular-nums">
                  {progressService.isModuleCompleted(activeModule.id) ? '100%' : '0%'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: progressService.isModuleCompleted(activeModule.id) ? '100%' : '0%' }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Weekly Quantum Study Hours Graph */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Weekly Simulation & Study Activity</h3>
                <p className="text-xs text-slate-400 mt-0.5">12.8 hours total this week</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">● High Coherence</span>
            </div>

            {/* Bar Chart Visual */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-slate-800/80">
              {weeklyActivity.map((d) => {
                const heightPercent = (d.hours / 3.0) * 100;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                      {d.hours}h
                    </span>
                    <div className="w-full bg-slate-900 rounded-t-lg overflow-hidden h-32 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-400">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Recently Simulated Circuit History */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Recent Circuit Workbench Experiments</h3>
            
            <div className="space-y-3">
              {[
                { title: 'Bell State |Φ+⟩ Creation', gates: 'H(0) -> CNOT(0,1)', status: 'Success (50% / 50%)', date: 'Today, 10:14 AM' },
                { title: 'Grover 2-Qubit Oracle', gates: 'H(all) -> Cz -> Inversion', status: 'Amplified to 92.5%', date: 'Yesterday' },
                { title: 'Single Qubit Phase Flip', gates: 'H -> Z -> H', status: 'Mapped to |1⟩', date: '2 days ago' }
              ].map((exp, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{exp.title}</div>
                    <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{exp.gates}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 font-medium">{exp.status}</span>
                    <span className="text-[10px] text-slate-400 block">{exp.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Right Column: Achievements & Badges (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Achievement Badges */}
          <GlassCard glow className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Earned Accreditations</h3>
              <span className="text-xs font-mono text-cyan-300 tabular-nums">{user.badges.length} Unlocked</span>
            </div>

            <div className="space-y-3">
              {user.badges.map((badge) => (
                <div key={badge.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{badge.name}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{badge.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">Unlocked {badge.unlockedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* AI Tutor Quick Access */}
          <GlassCard className="p-6 text-center">
            <h4 className="text-sm font-bold text-white mb-2">Need Help Understanding a Circuit?</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Our AI Quantum Tutor can walk you through complex unitary transformations and phase kickback.
            </p>
            <Button3D
              variant="purple"
              size="sm"
              fullWidth
              onClick={() => navigate('/tutor')}
            >
              Open AI Tutor Chat
            </Button3D>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
