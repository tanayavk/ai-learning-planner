import React from 'react';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  HelpCircle, 
  TrendingUp, 
  User, 
  Sparkles, 
  Award,
  ChevronRight
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  profileData, 
  systemStatus, 
  onOpenProfile 
}) {
  const stats = profileData?.stats || {};
  const isKeyConfigured = systemStatus?.api_key_configured;

  const tabs = [
    { id: 'plan', label: 'Study Plan', icon: Calendar, color: 'text-indigo-600', activeBg: 'bg-indigo-600 text-white' },
    { id: 'notes', label: 'AI Notes', icon: BookOpen, color: 'text-emerald-600', activeBg: 'bg-emerald-600 text-white' },
    { id: 'quiz', label: 'Quiz Engine', icon: HelpCircle, color: 'text-purple-600', activeBg: 'bg-purple-600 text-white' },
    { id: 'progress', label: 'Progress & Stats', icon: TrendingUp, color: 'text-amber-600', activeBg: 'bg-amber-600 text-white', badge: `${stats.completed_topics_count || 0}` },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                  AI Learning Planner
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-purple-600" />
                  Groq AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Personalized study roadmaps, interactive quizzes & mastery analytics
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-md shadow-slate-200/60 ring-1 ring-slate-200/60 scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls / Profile Button */}
          <div className="flex items-center gap-2.5">
            {/* Status indicator */}
            <div 
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isKeyConfigured 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
              title={isKeyConfigured ? 'Groq API Key Connected' : 'API Key Missing in .env'}
            >
              <span className={`w-2 h-2 rounded-full ${isKeyConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[11px]">{isKeyConfigured ? 'AI Online' : 'Key Needed'}</span>
            </div>

            {/* Profile pill button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/90 text-slate-700 transition-all duration-200 group shadow-xs hover:shadow-md hover:border-indigo-300"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>{stats.skill_level || 'Beginner'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-indigo-600 font-mono font-bold">{stats.preferred_study_hours || 2}h/d</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>{stats.average_quiz_score ? `${stats.average_quiz_score}% avg` : 'No quiz taken'}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-200/70 py-2 justify-around gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'text-indigo-600 bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? tab.color : 'text-slate-400'}`} />
                <span>{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
