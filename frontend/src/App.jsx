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

import { Sparkles, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

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
    const [pRes, plRes] = await Promise.all([fetchProfile(), fetchPlan()]);
    setProfileData(pRes);
    setPlanData(plRes);
    showToast('success', `Created ${days}-day plan for "${goal}"!`);
    return res;
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      await updateTask(taskId, completed);
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700 space-y-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <Sparkles className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-600">Loading AI Learning Planner...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 bg-mesh-pattern text-slate-800 flex flex-col selection:bg-indigo-600 selection:text-white relative">
      
      {/* Dynamic ambient color blooms */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-20 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-1/3 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

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
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2.5 bg-white/95 backdrop-blur-md ${
            toast.type === 'success' 
              ? 'border-emerald-300 text-emerald-800 shadow-emerald-500/10' 
              : toast.type === 'error'
              ? 'border-rose-300 text-rose-800 shadow-rose-500/10'
              : 'border-indigo-300 text-indigo-800 shadow-indigo-500/10'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-600" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Missing API Key Alert banner if needed */}
      {systemStatus && !systemStatus.api_key_configured && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 text-center text-xs sm:text-sm text-amber-900 font-medium">
          <span className="font-bold">⚠️ Notice:</span> GROQ_API_KEY is not detected in your <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-800">.env</code> file. Add your Groq API key to generate plans, notes, and quizzes with AI.
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
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AI Personal Learning & Task Planner</span>
            <span className="text-slate-300">•</span>
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-indigo-200">
              v2.0 React
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Powered by Groq Llama 3 & FastAPI
            </span>
            <button
              onClick={loadAllData}
              className="text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1"
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
