import React from 'react';
import { Link } from 'react-router-dom';
import { Atom, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#04060e] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/30 flex items-center justify-center shadow-[0_0_8px_rgba(34,211,238,0.2)]">
                <img src="/favicon.svg" alt="QuantumLearn AI Icon" className="w-full h-full object-cover" />
              </div>
              <span className="font-outfit font-bold text-slate-100 text-lg">QuantumLearn AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive quantum algorithm education platform empowering students, developers, and researchers with visual circuit simulation and pedagogical AI guidance.
            </p>
            <div className="text-[11px] text-slate-400">
              <span>Frontend Foundation · Part 1 Preview</span>
            </div>
          </div>

          {/* Quick learning pathways */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Curriculum</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/modules" className="hover:text-cyan-400 transition-colors">Quantum Fundamentals</Link></li>
              <li><Link to="/modules" className="hover:text-cyan-400 transition-colors">Qubit Gates & Unitary Ops</Link></li>
              <li><Link to="/modules" className="hover:text-cyan-400 transition-colors">Quantum Entanglement & Bell</Link></li>
              <li><Link to="/modules" className="hover:text-cyan-400 transition-colors">Quantum Error Correction</Link></li>
            </ul>
          </div>

          {/* Algorithms & tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Workbench & Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/lab" className="hover:text-cyan-400 transition-colors">Interactive Circuit Builder</Link></li>
              <li><Link to="/simulator" className="hover:text-cyan-400 transition-colors">3D Bloch Sphere Simulator</Link></li>
              <li><Link to="/algorithms" className="hover:text-cyan-400 transition-colors">Algorithm Explorer Library</Link></li>
              <li><Link to="/tutor" className="hover:text-cyan-400 transition-colors">Quantum AI Tutor</Link></li>
              <li><Link to="/quizzes" className="hover:text-cyan-400 transition-colors">Concept Verification Quizzes</Link></li>
            </ul>
          </div>

          {/* Academic & Hardware resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Academic References</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://quantum-computing.ibm.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  IBM Quantum Composer
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://qiskit.org/textbook"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  Qiskit Textbook
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://quantumai.google/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  Google Quantum AI Cirq
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with demo transparency notice */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 QuantumLearn AI. Designed for higher education and independent learning.</p>
          <p className="text-[11px] text-slate-400">
            Educational simulation models. Simulation calculations are executed locally via client-side matrix mechanics.
          </p>
        </div>
      </div>
    </footer>
  );
};
