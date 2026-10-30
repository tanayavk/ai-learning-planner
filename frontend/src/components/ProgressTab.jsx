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
  Calendar, 
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

  const [filter, setFilter] = useState('all'); // all | pending | completed
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
      <section className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Performance & Mastery Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Learning Progress & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time tracking of planned milestones, active study hours, and quiz retention metrics.
          </p>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Completion % */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Completion</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">
            {progressPercent}%
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats.completed_tasks || 0} of {stats.total_tasks || 0} tasks finished
          </p>
        </div>

        {/* Study Hours */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Study Hours</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">
            {stats.completed_hours || 0}h
          </div>
          <div className="text-xs text-slate-400 mt-2">
            out of <span className="text-indigo-400 font-semibold">{stats.total_hours || 0}h</span> planned
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Target: {profile.preferred_study_hours || 2}h / day
          </p>
        </div>

        {/* Quiz Average */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quiz Average</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">
            {profileData?.stats?.average_quiz_score ? `${profileData.stats.average_quiz_score}%` : 'N/A'}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            across <span className="text-amber-400 font-semibold">{quizScores.length}</span> assessments
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {quizScores.length > 0 ? 'Logged to memory' : 'No quiz taken yet'}
          </p>
        </div>

        {/* Mastered Topics */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mastered Topics</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <BookCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">
            {completedTopics.length}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Skill Tier: <span className="text-purple-400 font-semibold">{profile.skill_level || 'Beginner'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Persistent learner profile
          </p>
        </div>

      </section>

      {/* Main Content: Tasks Checklist & Quiz History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Tasks Checklist (2 cols wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Curriculum Tasks Checklist</h3>
                <p className="text-xs text-slate-400">Mark items complete to update your overall roadmap progress</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
                {['all', 'pending', 'completed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                      filter === f
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plan tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm text-slate-200"
              />
            </div>

            {/* Tasks List */}
            {filteredTasks.length > 0 ? (
              <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto pr-1">
                {filteredTasks.map((t) => (
                  <div key={t.id} className="py-3.5 flex items-start gap-3.5 group">
                    <button
                      type="button"
                      onClick={() => onToggleTask(t.id, !t.completed)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        t.completed
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                          : 'border-slate-600 hover:border-indigo-400 bg-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          Day {t.day}
                        </span>
                        <h4 className={`text-sm font-semibold truncate ${
                          t.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}>
                          {t.title}
                        </h4>
                        <span className="text-[11px] font-mono text-indigo-400">
                          ~{t.estimated_hours}h
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-1 ${
                        t.completed ? 'text-slate-600' : 'text-slate-400'
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
                    <p className="mb-2">No active learning plan tasks found.</p>
                    <button 
                      onClick={onGoToPlan}
                      className="text-indigo-400 hover:underline font-semibold"
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
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Quiz History</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {quizScores.length} records
              </span>
            </div>

            {quizScores.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {quizScores.slice().reverse().map((s, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {s.topic}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {s.correct} of {s.total} correct
                      </div>
                    </div>
                    
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${
                      s.percent >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : s.percent >= 50
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {s.percent}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No quizzes recorded yet. Take a quiz to track your mastery scores here!
              </div>
            )}
          </div>

          {/* Mastered Topics Tags */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed Topics</span>
            </h3>

            {completedTopics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {completedTopics.map((topic, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{topic}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Tick tasks off in your study plan to record completed topics.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
