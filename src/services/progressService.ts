/**
 * Progress Service for QuantumLearn AI
 * Handles client-side persistence of lesson completion and quiz performance.
 * Designed as an isolated data access layer to be easily swapped with a FastAPI backend.
 */

const STORAGE_KEYS = {
  COMPLETED_MODULES: 'quantumlearn_completed_modules',
  QUIZ_SCORES: 'quantumlearn_quiz_scores',
  USER_XP: 'quantumlearn_user_xp',
  LAST_ACTIVE_DATE: 'quantumlearn_last_active_date',
  STREAK_DAYS: 'quantumlearn_streak_days',
};

// Default starter progress (Module 1 completed)
const DEFAULT_COMPLETED_MODULES = ['mod-1'];
const DEFAULT_INITIAL_XP = 1250;

type ProgressChangeListener = () => void;
const listeners: Set<ProgressChangeListener> = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Error notifying progress listener:', err);
    }
  });
};

export const progressService = {
  subscribe(listener: ProgressChangeListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getCompletedModuleIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_MODULES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COMPLETED_MODULES, JSON.stringify(DEFAULT_COMPLETED_MODULES));
        return DEFAULT_COMPLETED_MODULES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_COMPLETED_MODULES;
    }
  },

  isModuleCompleted(moduleId: string): boolean {
    const completed = this.getCompletedModuleIds();
    return completed.includes(moduleId);
  },

  markModuleCompleted(moduleId: string): void {
    const completed = this.getCompletedModuleIds();
    if (!completed.includes(moduleId)) {
      const updated = [...completed, moduleId];
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLETED_MODULES, JSON.stringify(updated));
        // Add 150 XP per completed module
        this.addXP(150);
      } catch (err) {
        console.error('Failed to save module completion', err);
      }
      notifyListeners();

      // Asynchronous background sync to backend if user is authenticated
      import('./apiClient')
        .then(({ apiClient }) => apiClient.syncProgress(moduleId, true))
        .catch(() => {
          // Backend offline or unauthenticated; local state safely preserved
        });
    }
  },

  markModuleIncomplete(moduleId: string): void {
    const completed = this.getCompletedModuleIds();
    if (completed.includes(moduleId)) {
      const updated = completed.filter((id) => id !== moduleId);
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLETED_MODULES, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update module completion', err);
      }
      notifyListeners();

      // Asynchronous background sync to backend
      import('./apiClient')
        .then(({ apiClient }) => apiClient.syncProgress(moduleId, false))
        .catch(() => {
          // Backend offline or unauthenticated
        });
    }
  },

  toggleModuleCompletion(moduleId: string): boolean {
    const isDone = this.isModuleCompleted(moduleId);
    if (isDone) {
      this.markModuleIncomplete(moduleId);
      return false;
    } else {
      this.markModuleCompleted(moduleId);
      return true;
    }
  },

  getQuizScores(): Record<string, { score: number; total: number; date: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_SCORES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveModuleQuizScore(moduleId: string, score: number, total: number): void {
    try {
      const scores = this.getQuizScores();
      scores[moduleId] = {
        score,
        total,
        date: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.QUIZ_SCORES, JSON.stringify(scores));
      // Award XP proportional to score
      this.addXP(score * 25);
    } catch (err) {
      console.error('Failed to save quiz score', err);
    }
    notifyListeners();
  },

  saveQuizScore(quizId: string, score: number, total: number): void {
    this.saveModuleQuizScore(quizId, score, total);
  },

  getModuleQuizScore(moduleId: string): { score: number; total: number; date: string } | null {
    const scores = this.getQuizScores();
    return scores[moduleId] || null;
  },

  getXP(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_XP);
      return data ? parseInt(data, 10) : DEFAULT_INITIAL_XP;
    } catch {
      return DEFAULT_INITIAL_XP;
    }
  },

  addXP(amount: number): void {
    try {
      const current = this.getXP();
      localStorage.setItem(STORAGE_KEYS.USER_XP, (current + amount).toString());
    } catch {
      // ignore
    }
  },

  getStreakDays(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STREAK_DAYS);
      return data ? parseInt(data, 10) : 14;
    } catch {
      return 14;
    }
  },

  getProgressStats(totalModulesCount: number): {
    completedCount: number;
    percentage: number;
    xp: number;
    streak: number;
  } {
    const completed = this.getCompletedModuleIds();
    const completedCount = completed.length;
    const percentage = totalModulesCount > 0 ? Math.round((completedCount / totalModulesCount) * 100) : 0;
    const xp = this.getXP();
    const streak = this.getStreakDays();

    return {
      completedCount,
      percentage,
      xp,
      streak
    };
  },

  resetProgress(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_MODULES, JSON.stringify([]));
      localStorage.removeItem(STORAGE_KEYS.QUIZ_SCORES);
      localStorage.setItem(STORAGE_KEYS.USER_XP, '0');
    } catch {
      // ignore
    }
    notifyListeners();
  }
};
