import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ModulesPage } from './pages/ModulesPage';
import { AlgorithmsPage } from './pages/AlgorithmsPage';
import { LabPage } from './pages/LabPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AITutorPage } from './pages/AITutorPage';
import { QuizPage } from './pages/QuizPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { AIMockInterviewPage } from './pages/AIMockInterviewPage';
import { AuthProvider } from './contexts/AuthContext';

// Scroll to top on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Footer only displayed on the home page ('/')
const ConditionalFooter: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname !== '/') return null;
  return <Footer />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#050814] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/modules" element={<ModulesPage />} />
              <Route path="/algorithms" element={<AlgorithmsPage />} />
              <Route path="/lab" element={<LabPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="/tutor" element={<AITutorPage />} />
              <Route path="/mock-interview" element={<AIMockInterviewPage />} />
              <Route path="/interview" element={<AIMockInterviewPage />} />
              <Route path="/quizzes" element={<QuizPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <ConditionalFooter />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
