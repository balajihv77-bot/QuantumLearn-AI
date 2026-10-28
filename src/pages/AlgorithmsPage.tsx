import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Cpu, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button3D } from '../components/common/Button3D';
import { AlgorithmCard } from '../components/cards/AlgorithmCard';
import { AlgorithmDetailView } from '../components/algorithms/AlgorithmDetailView';
import { DEMO_ALGORITHMS } from '../data/demoData';
import { QuantumAlgorithm } from '../types/quantum';

export const AlgorithmsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const selectedSlug = searchParams.get('selected');
  const selectedAlgorithm = useMemo(() => {
    if (!selectedSlug) return null;
    return DEMO_ALGORITHMS.find((a) => a.slug === selectedSlug) || null;
  }, [selectedSlug]);

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredAlgorithms = useMemo(() => {
    return DEMO_ALGORITHMS.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.quantumSpeedup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.inventor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDifficulty = selectedDifficulty === 'All' || a.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [searchTerm, selectedDifficulty]);

  const handleOpenAlgorithm = (algo: QuantumAlgorithm) => {
    setSearchParams({ selected: algo.slug });
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  if (selectedAlgorithm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AlgorithmDetailView
          algorithm={selectedAlgorithm}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Algorithmic Advantage</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Quantum Algorithm Library</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Explore foundational algorithms that demonstrate provable speedups over classical computing, with simplified circuit schematics, implementation code, and expected behavior models.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search algorithms (Bell, Teleportation, Grover, Shor, QFT...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800/80 self-start md:self-auto">
          <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1" />
          {difficulties.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedDifficulty === level
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Algorithms Grid */}
      {filteredAlgorithms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlgorithms.map((algo) => (
            <AlgorithmCard
              key={algo.id}
              algorithm={algo}
              onExplore={handleOpenAlgorithm}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="p-12 text-center">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No matching algorithms found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to view all quantum algorithms.
          </p>
          <div className="mt-5">
            <Button3D
              variant="dark"
              size="sm"
              onClick={() => {
                setSearchTerm('');
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

