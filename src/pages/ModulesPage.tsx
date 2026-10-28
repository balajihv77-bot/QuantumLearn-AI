import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Clock, CheckCircle2, Award, Sparkles, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button3D } from '../components/common/Button3D';
import { ModuleCard } from '../components/cards/ModuleCard';
import { ModuleLessonView } from '../components/modules/ModuleLessonView';
import { DEMO_MODULES } from '../data/demoData';
import { QuantumModule } from '../types/quantum';
import { progressService } from '../services/progressService';

export const ModulesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Progress stats subscription
  const [progressStats, setProgressStats] = useState(() =>
    progressService.getProgressStats(DEMO_MODULES.length)
  );

  useEffect(() => {
    const updateStats = () => setProgressStats(progressService.getProgressStats(DEMO_MODULES.length));
    updateStats();
    return progressService.subscribe(updateStats);
  }, []);

  const selectedSlug = searchParams.get('selected');
  const activeModule = useMemo(() => {
    if (!selectedSlug) return null;
    return DEMO_MODULES.find((m) => m.slug === selectedSlug) || null;
  }, [selectedSlug]);

  const categories = ['All', 'Fundamentals', 'Gates & Circuits', 'Algorithms'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredModules = useMemo(() => {
    return DEMO_MODULES.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.topicsCovered.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || m.level === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const handleOpenModule = (module: QuantumModule) => {
    setSearchParams({ selected: module.slug });
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  // If a specific module is selected, render the dedicated in-depth lesson view
  if (activeModule) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ModuleLessonView
          module={activeModule}
          allModules={DEMO_MODULES}
          onNavigateModule={(slug) => setSearchParams({ selected: slug })}
          onBackToList={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Curriculum Path</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Interactive Learning Modules</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Step-by-step interactive lessons covering quantum fundamentals, Dirac bra-ket notation, superposition, entanglement, unitary gates, and algorithmic advantages.
        </p>
      </div>

      {/* Real-Time Progress Summary Banner */}
      <GlassCard glow className="p-5 sm:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-cyan-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curriculum Progress Tracking</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            {progressStats.completedCount} of {DEMO_MODULES.length} Modules Completed
          </h3>
          <p className="text-xs text-slate-400">
            Progress is automatically saved locally and synchronized across your student dashboard.
          </p>
        </div>

        <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Scholar XP</span>
            <span className="font-mono text-xl font-bold text-cyan-300 tabular-nums">+{progressStats.xp} XP</span>
          </div>

          <div className="w-32">
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>Progress</span>
              <span className="font-bold text-cyan-400">{progressStats.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progressStats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter and Search Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search quantum topics, gates, superposition, entanglement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
          </div>

          {/* Difficulty Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800/80 self-start md:self-auto">
            <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1" />
            {difficulties.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedDifficulty === level
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onSelect={handleOpenModule}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No matching quantum modules found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to view all foundational courses.
          </p>
          <div className="mt-5">
            <Button3D
              variant="dark"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
            >
              Reset Filters
            </Button3D>
          </div>
        </GlassCard>
      )}

    </div>
  );
};

