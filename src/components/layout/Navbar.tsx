import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Atom, Menu, X, User } from 'lucide-react';
import { Button3D } from '../common/Button3D';
import { useAuth } from '../../contexts/AuthContext';

export interface NavbarProps {
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ userName: propUserName }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const displayName = user?.full_name || user?.username || propUserName || 'Student';

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Modules', path: '/modules' },
    { label: 'Algorithms', path: '/algorithms' },
    { label: 'Quantum Lab', path: '/lab' },
    { label: 'Simulator', path: '/simulator' },
    { label: 'AI Tutor', path: '/tutor' },
    { label: 'AI Mock Interview', path: '/mock-interview' },
    { label: 'Challenges', path: '/quizzes' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Student Profile', path: '/profile' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/15 bg-[#050814]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 lg:gap-6">
        
        {/* Zone 1: Brand Wordmark Element */}
        <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40 group-hover:border-cyan-400 transition-colors shadow-[0_0_12px_rgba(34,211,238,0.25)]">
            <img src="./favicon.svg" alt="QuantumLearn AI Icon" className="w-full h-full object-cover" />
          </div>
          <span className="font-outfit text-xl">
            Quantum<span className="text-cyan-400">Learn</span> <span className="text-xs px-1.5 py-0.5 rounded font-mono font-medium text-purple-300 border border-purple-500/30 bg-purple-950/40">AI</span>
          </span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-4 text-xs xl:text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                isActive(link.path)
                  ? 'text-cyan-400 font-semibold'
                  : 'hover:text-cyan-300'
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Student Profile Control */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/profile">
              <Button3D
                variant={isAuthenticated ? "dark" : "cyan"}
                size="sm"
                leftIcon={<User className="w-3.5 h-3.5 text-cyan-400" />}
                title="Open Student Profile"
              >
                <span className="max-w-[140px] truncate">
                  {isAuthenticated ? displayName : 'Student Profile'}
                </span>
              </Button3D>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-cyan-500/15 bg-[#070b1c]/95 backdrop-blur-2xl px-5 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <Button3D variant="cyan" size="sm" fullWidth leftIcon={<User className="w-4 h-4" />}>
                {isAuthenticated ? `Student Profile (${displayName})` : 'Student Profile'}
              </Button3D>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
