import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Award, Cpu, BookOpen, ArrowRight, User } from 'lucide-react';
import { UserProfile } from '../../types/quantum';
import { GlassCard } from '../common/GlassCard';
import { Button3D } from '../common/Button3D';
import { progressService } from '../../services/progressService';
import { DEMO_MODULES } from '../../data/demoData';

export interface ProgressCardProps {
  user: UserProfile;
  onResumeLearning: () => void;
  className?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  user,
  onResumeLearning,
  className = ''
}) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(() => progressService.getProgressStats(DEMO_MODULES.length));

  useEffect(() => {
    const update = () => setStats(progressService.getProgressStats(DEMO_MODULES.length));
    update();
    return progressService.subscribe(update);
  }, []);

  return (
    <GlassCard glow className={`p-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">Active Learning Cohort</span>
          <h3 className="text-xl font-bold text-slate-100 mt-1">Welcome back, {user.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{user.institution} · Level {user.level} Quantum Scholar</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button3D
            variant="dark"
            size="md"
            onClick={() => navigate('/profile')}
            leftIcon={<User className="w-4 h-4 text-cyan-400" />}
          >
            Student Profile
          </Button3D>
          <Button3D
            variant="cyan"
            size="md"
            onClick={onResumeLearning}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Resume Active Curriculum
          </Button3D>
        </div>
      </div>

      {/* Numerical Metrics Grid with Tabular Figures */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Flame className="w-4 h-4" />
            <span>Learning Streak</span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100 tabular-nums mt-1">
            {stats.streak} <span className="text-xs font-sans text-slate-400 font-normal">days</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
            <BookOpen className="w-4 h-4" />
            <span>Completed Modules</span>
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-300 tabular-nums mt-1">
            {stats.completedCount} <span className="text-xs font-sans text-slate-400 font-normal">/ {DEMO_MODULES.length}</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
            <Cpu className="w-4 h-4" />
            <span>Circuits Tested</span>
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300 tabular-nums mt-1">
            {user.circuitsSimulated}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <Award className="w-4 h-4" />
            <span>Scholar XP</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-300 tabular-nums mt-1">
            {stats.xp} <span className="text-xs font-sans text-slate-400 font-normal">XP</span>
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

