import React from 'react';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  HelpCircle, 
  TrendingUp, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Award,
  Clock
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
    { id: 'plan', label: 'Study Plan', icon: Calendar, badge: null },
    { id: 'notes', label: 'AI Notes', icon: BookOpen, badge: null },
    { id: 'quiz', label: 'Knowledge Quiz', icon: HelpCircle, badge: null },
    { id: 'progress', label: 'Progress & Stats', icon: TrendingUp, badge: `${stats.completed_topics_count || 0}` },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  AI Learning Planner
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  Groq AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Personalized study roadmaps, notes & intelligent testing
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-800/60 border border-slate-700/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-indigo-800/60 text-white' : 'bg-slate-700 text-slate-300'
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
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                isKeyConfigured 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}
              title={isKeyConfigured ? 'Groq API Key Active' : 'API Key Missing in .env'}
            >
              <span className={`w-2 h-2 rounded-full ${isKeyConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium text-[11px]">{isKeyConfigured ? 'Online' : 'Set GROQ_API_KEY'}</span>
            </div>

            {/* Profile pill button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-all duration-200 group hover:border-indigo-500/50"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  <span>{stats.skill_level || 'Beginner'}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-indigo-400 font-mono">{stats.preferred_study_hours || 2}h/d</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>{stats.average_quiz_score ? `${stats.average_quiz_score}% avg` : 'No quiz yet'}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-800/80 py-2 justify-around gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
