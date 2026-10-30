import React, { useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Award, 
  Search, 
  Filter, 
  Check, 
  BookCheck, 
  Target, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function ProgressTab({ 
  planData, 
  profileData, 
  onToggleTask, 
  onGoToPlan 
}) {
  const profile = profileData?.profile || {};
  const stats = planData?.stats || {};
  const tasks = planData?.tasks || [];
  const progressPercent = planData?.progress_percent || 0;
  const quizScores = profile?.quiz_scores || [];
  const completedTopics = profile?.completed_topics || [];

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'completed' ? t.completed :
      !t.completed;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner / Hero */}
      <section className="glass-panel p-6 sm:p-9 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/20 to-emerald-50/20 border border-slate-200/90 shadow-lg shadow-indigo-500/5">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs mb-3.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            Performance & Mastery Dashboard
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Learning Progress & Analytics
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 font-normal leading-relaxed">
            Monitor real-time progress across curriculum milestones, cumulative study hours, and knowledge retention rates.
          </p>
        </div>
      </section>

      {/* Colorful KPI Cards Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Completion % */}
        <div className="p-5 sm:p-6 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Completion</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-mono">
            {progressPercent}%
          </div>
          <div className="w-full h-2 bg-emerald-100 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-2xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            <span className="text-emerald-700 font-bold">{stats.completed_tasks || 0}</span> of {stats.total_tasks || 0} tasks done
          </p>
        </div>

        {/* Study Hours */}
        <div className="p-5 sm:p-6 rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-white to-indigo-50/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Study Hours</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-mono">
            {stats.completed_hours || 0}h
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            of <span className="text-indigo-700 font-bold">{stats.total_hours || 0}h</span> planned
          </div>
          <p className="text-xs text-indigo-600 mt-1 font-semibold">
            Target: {profile.preferred_study_hours || 2}h / day
          </p>
        </div>

        {/* Quiz Average */}
        <div className="p-5 sm:p-6 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Quiz Average</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-mono">
            {profileData?.stats?.average_quiz_score ? `${profileData.stats.average_quiz_score}%` : 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            across <span className="text-amber-700 font-bold">{quizScores.length}</span> tests taken
          </div>
          <p className="text-xs text-amber-700 mt-1 font-semibold">
            {quizScores.length > 0 ? 'Logged to memory' : 'No quiz taken yet'}
          </p>
        </div>

        {/* Mastered Topics */}
        <div className="p-5 sm:p-6 rounded-3xl border border-purple-200/80 bg-gradient-to-br from-white to-purple-50/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">Mastered Topics</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
              <BookCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-mono">
            {completedTopics.length}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Tier: <span className="text-purple-700 font-bold">{profile.skill_level || 'Beginner'}</span>
          </div>
          <p className="text-xs text-purple-700 mt-1 font-semibold">
            Persistent learner memory
          </p>
        </div>

      </section>

      {/* Main Content: Tasks Checklist & Quiz History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Tasks Checklist (2 cols wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200/90 bg-white shadow-md space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Curriculum Tasks Checklist</h3>
                <p className="text-xs text-slate-500 font-medium">Mark items complete to update your overall roadmap progress</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
                {['all', 'pending', 'completed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                      filter === f
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plan tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl glass-input text-xs sm:text-sm text-slate-900 shadow-xs"
              />
            </div>

            {/* Tasks List */}
            {filteredTasks.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
                {filteredTasks.map((t) => (
                  <div key={t.id} className="py-3.5 flex items-start gap-3.5 group">
                    <button
                      type="button"
                      onClick={() => onToggleTask(t.id, !t.completed)}
                      className={`mt-0.5 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                        t.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white font-bold shadow-xs'
                          : 'border-slate-300 hover:border-indigo-500 bg-white text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Day {t.day}
                        </span>
                        <h4 className={`text-sm font-bold truncate ${
                          t.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}>
                          {t.title}
                        </h4>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          ~{t.estimated_hours}h
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-1 ${
                        t.completed ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {t.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                {tasks.length === 0 ? (
                  <div>
                    <p className="mb-2 font-medium">No active learning plan tasks found.</p>
                    <button 
                      onClick={onGoToPlan}
                      className="text-indigo-600 hover:text-indigo-700 font-bold"
                    >
                      Create a Plan First →
                    </button>
                  </div>
                ) : (
                  'No tasks match your search or filter.'
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Quiz Score History & Mastered Skills */}
        <div className="space-y-6">
          
          {/* Quiz Performance History */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/90 bg-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Quiz Performance</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono font-bold">
                {quizScores.length} logged
              </span>
            </div>

            {quizScores.length > 0 ? (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {quizScores.slice().reverse().map((s, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {s.topic}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {s.correct} of {s.total} correct
                      </div>
                    </div>
                    
                    <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-xl border shadow-2xs ${
                      s.percent >= 80
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : s.percent >= 50
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {s.percent}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs font-medium">
                No quizzes recorded yet. Take a quiz to track your retention scores here!
              </div>
            )}
          </div>

          {/* Mastered Topics Tags */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/90 bg-white shadow-md space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Mastered Topics</span>
            </h3>

            {completedTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {completedTopics.map((topic, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>{topic}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Check off tasks in your study plan to record completed topics here.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
