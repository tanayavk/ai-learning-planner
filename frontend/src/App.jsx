import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PlanTab from './components/PlanTab';
import NotesTab from './components/NotesTab';
import QuizTab from './components/QuizTab';
import ProgressTab from './components/ProgressTab';
import ProfileModal from './components/ProfileModal';

import { 
  fetchStatus, 
  fetchProfile, 
  updateProfile, 
  resetProfile, 
  fetchPlan, 
  generatePlan, 
  clearPlan, 
  updateTask, 
  generateNotes, 
  generateQuiz, 
  submitQuiz 
} from './api';

import { Sparkles, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('plan');
  const [systemStatus, setSystemStatus] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cross-tab interaction pre-fills
  const [notesTopic, setNotesTopic] = useState('');
  const [quizTopic, setQuizTopic] = useState('');

  // Modals & Notifications
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statusRes, profileRes, planRes] = await Promise.all([
        fetchStatus().catch(() => ({ status: 'error', api_key_configured: false })),
        fetchProfile().catch(() => ({ profile: {}, stats: {} })),
        fetchPlan().catch(() => ({ tasks: [], stats: {} })),
      ]);

      setSystemStatus(statusRes);
      setProfileData(profileRes);
      setPlanData(planRes);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // API Action Handlers
  const handleGeneratePlan = async (goal, days, level, hours) => {
    const res = await generatePlan(goal, days, level, hours);
    // Reload plan and profile
    const [pRes, plRes] = await Promise.all([fetchProfile(), fetchPlan()]);
    setProfileData(pRes);
    setPlanData(plRes);
    showToast('success', `Created ${days}-day plan for "${goal}"!`);
    return res;
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      await updateTask(taskId, completed);
      // Reload both plan and profile data to keep counts in sync
      const [pRes, plRes] = await Promise.all([fetchProfile(), fetchPlan()]);
      setProfileData(pRes);
      setPlanData(plRes);
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleClearPlan = async () => {
    try {
      await clearPlan();
      const [pRes, plRes] = await Promise.all([fetchProfile(), fetchPlan()]);
      setProfileData(pRes);
      setPlanData(plRes);
      showToast('info', 'Study plan cleared.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleUpdateProfile = async (data) => {
    const res = await updateProfile(data);
    const pRes = await fetchProfile();
    setProfileData(pRes);
    showToast('success', 'Profile preferences updated!');
    return res;
  };

  const handleResetProfile = async () => {
    try {
      await resetProfile();
      const pRes = await fetchProfile();
      setProfileData(pRes);
      showToast('info', 'Profile reset to default.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleGoToNotes = (topic) => {
    setNotesTopic(topic);
    setActiveTab('notes');
  };

  const handleGoToQuiz = (topic) => {
    setQuizTopic(topic);
    setActiveTab('quiz');
  };

  const handleGoToPlan = () => {
    setActiveTab('plan');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide">Loading AI Learning Planner...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative">
      
      {/* Background glow accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-indigo-600/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profileData={profileData}
        systemStatus={systemStatus}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold flex items-center gap-2.5 ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Missing API Key Alert banner if needed */}
      {systemStatus && !systemStatus.api_key_configured && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center text-xs sm:text-sm text-amber-300">
          <span className="font-bold">⚠️ Warning:</span> GROQ_API_KEY is not detected in your <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">.env</code> file. Add your Groq key to enable AI plan and quiz generation.
        </div>
      )}

      {/* Main Tab View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {activeTab === 'plan' && (
          <PlanTab
            planData={planData}
            profileData={profileData}
            onGeneratePlan={handleGeneratePlan}
            onToggleTask={handleToggleTask}
            onClearPlan={handleClearPlan}
            onGoToNotes={handleGoToNotes}
            onGoToQuiz={handleGoToQuiz}
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab
            planData={planData}
            profileData={profileData}
            initialTopic={notesTopic}
            onGenerateNotes={generateNotes}
            onGoToQuiz={handleGoToQuiz}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizTab
            planData={planData}
            profileData={profileData}
            initialTopic={quizTopic}
            onGenerateQuiz={generateQuiz}
            onSubmitQuiz={submitQuiz}
            onGoToNotes={handleGoToNotes}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            planData={planData}
            profileData={profileData}
            onToggleTask={handleToggleTask}
            onGoToPlan={handleGoToPlan}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>AI-Based Personal Learning & Task Planner</span>
            <span>•</span>
            <span className="text-slate-400 font-mono">v2.0 React</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Powered by Groq Llama 3 & FastAPI
            </span>
            <button
              onClick={loadAllData}
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
              title="Refresh all data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync
            </button>
          </div>
        </div>
      </footer>

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profileData={profileData}
        onUpdateProfile={handleUpdateProfile}
        onResetProfile={handleResetProfile}
        onClearPlan={handleClearPlan}
      />

    </div>
  );
}
