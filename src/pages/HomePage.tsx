import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Cpu, Compass, BookOpen, Layers, ShieldCheck, Zap } from 'lucide-react';
import { Button3D } from '../components/common/Button3D';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleCard } from '../components/cards/ModuleCard';
import { AlgorithmCard } from '../components/cards/AlgorithmCard';
import { ProgressCard } from '../components/cards/ProgressCard';
import { QuantumVisualParticle } from '../components/visualization/QuantumVisualParticle';
import { DEMO_MODULES, DEMO_ALGORITHMS, DEMO_USER_PROFILE } from '../data/demoData';
import { QuantumModule, QuantumAlgorithm } from '../types/quantum';

import heroImage from '../assets/images/quantum_hero_computing_1791564204281.jpg';
import blochImage from '../assets/images/bloch_sphere_concept_1791564220134.jpg';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const featuredModules = DEMO_MODULES.slice(0, 3);
  const featuredAlgorithms = DEMO_ALGORITHMS.slice(0, 3);

  const handleSelectModule = (module: QuantumModule) => {
    navigate(`/modules?selected=${module.slug}`);
  };

  const handleExploreAlgorithm = (algorithm: QuantumAlgorithm) => {
    navigate(`/algorithms?selected=${algorithm.slug}`);
  };

  return (
    <div className="relative overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 quantum-grid-bg">
        {/* Ambient background particle simulation */}
        <div className="absolute inset-0 z-0">
          <QuantumVisualParticle className="w-full h-full opacity-40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & 3D CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Quantum Computing Academy</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-outfit text-balance leading-tight">
              Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Quantum World</span> with Intuitive AI
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Demystify superposition, entanglement, and quantum algorithms through 3D state visualization, interactive drag-and-drop circuit lab, and step-by-step AI guidance.
            </p>

            {/* Mandatory 3D CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button3D
                variant="cyan"
                size="lg"
                onClick={() => navigate('/modules')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Start Learning
              </Button3D>

              <Button3D
                variant="dark"
                size="lg"
                onClick={() => navigate('/lab')}
                leftIcon={<Cpu className="w-5 h-5 text-cyan-400" />}
              >
                Explore Quantum Lab
              </Button3D>

              <Button3D
                variant="purple"
                size="lg"
                onClick={() => navigate('/simulator')}
                leftIcon={<Compass className="w-5 h-5 text-purple-300" />}
              >
                3D Bloch Simulator
              </Button3D>
            </div>

            {/* Quick Unboxed Indicators */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <span>Zero Installation Required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
                <span>Bloch Sphere 3D Spatial Visuals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span>Academic Linear Algebra Aligned</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Artwork */}
          <div className="lg:col-span-5 relative">
            <GlassCard glow className="relative p-2.5 overflow-hidden rounded-3xl border border-cyan-500/30">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950">
                <img
                  src={heroImage}
                  alt="Superconducting quantum processor core with coherent laser interconnects"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Floating State Vector Overlay */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-3.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 flex flex-col gap-2.5">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Superposition State</span>
                    <span className="font-mono text-xs sm:text-sm text-slate-100 font-semibold block mt-0.5">|ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩</span>
                  </div>
                  <div className="pt-0.5">
                    <Button3D
                      variant="cyan"
                      size="sm"
                      onClick={() => navigate('/simulator')}
                      leftIcon={<Compass className="w-3.5 h-3.5" />}
                    >
                      Inspect in 3D
                    </Button3D>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Student Progress Preview Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ProgressCard
          user={DEMO_USER_PROFILE}
          onResumeLearning={() => navigate('/modules?selected=intro-to-quantum-computing')}
        />
      </section>

      {/* Featured Learning Modules */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Curriculum Path</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Featured Learning Modules</h2>
            <p className="text-sm text-slate-400 mt-1">Foundational lessons built with interactive visual sandboxes.</p>
          </div>
          <Button3D
            variant="dark"
            size="sm"
            onClick={() => navigate('/modules')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View All 9 Modules
          </Button3D>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onSelect={handleSelectModule}
            />
          ))}
        </div>
      </section>

      {/* Quantum Algorithms Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Algorithmic Advantage</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Popular Quantum Algorithms</h2>
            <p className="text-sm text-slate-400 mt-1">Analyze speedups, circuit gates, and mathematical oracles.</p>
          </div>
          <Button3D
            variant="dark"
            size="sm"
            onClick={() => navigate('/algorithms')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Library
          </Button3D>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAlgorithms.map((algo) => (
            <AlgorithmCard
              key={algo.id}
              algorithm={algo}
              onExplore={handleExploreAlgorithm}
            />
          ))}
        </div>
      </section>

      {/* Interactive Platform Capabilities */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Interactive Architecture</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Built for Intuitive Quantum Mastery</h2>
          <p className="text-sm text-slate-400 mt-2">
            No steep mathematical barrier. Experience quantum phenomena directly through interactive visual models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard hoverEffect className="p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">3D Bloch Sphere Simulator</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Manipulate pure qubit states in continuous 3D space. Observe how Hadamard, Pauli, and phase gates rotate state vectors on the unit sphere.
            </p>
            <div className="mt-5">
              <Button3D
                variant="dark"
                size="sm"
                onClick={() => navigate('/simulator')}
              >
                Launch 3D Sphere
              </Button3D>
            </div>
          </GlassCard>

          <GlassCard hoverEffect className="p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Interactive Circuit Workbench</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Design multi-qubit quantum circuits with drag-and-click ease. Test entanglement, measure outcome probabilities, and observe state collapse.
            </p>
            <div className="mt-5">
              <Button3D
                variant="dark"
                size="sm"
                onClick={() => navigate('/lab')}
              >
                Open Circuit Lab
              </Button3D>
            </div>
          </GlassCard>

          <GlassCard hoverEffect className="p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">AI Pedagogical Tutor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ask deep questions about quantum interference, no-cloning theorem, or complex amplitudes. Receive clear breakdowns with mathematical context.
            </p>
            <div className="mt-5">
              <Button3D
                variant="dark"
                size="sm"
                onClick={() => navigate('/tutor')}
              >
                Chat with AI Tutor
              </Button3D>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Bloch Visual Highlight Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <GlassCard glow className="p-8 md:p-12 border border-cyan-500/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Concept Spotlight</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-outfit">
                Visualize Superposition & Relative Phase in 3D
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The Bloch sphere maps complex two-dimensional Hilbert space onto the surface of a three-dimensional Euclidean sphere. Discover how unitary matrices correspond to rigid spatial rotations around the X, Y, and Z axes.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Button3D
                  variant="cyan"
                  size="md"
                  onClick={() => navigate('/simulator')}
                >
                  Enter 3D Sphere Sandbox
                </Button3D>
                <Button3D
                  variant="dark"
                  size="md"
                  onClick={() => navigate('/modules?selected=quantum-fundamentals')}
                >
                  Read Theory Guide
                </Button3D>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl max-w-md w-full">
                <img
                  src={blochImage}
                  alt="3D Quantum Bloch Sphere with state vector arrow"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

    </div>
  );
};
