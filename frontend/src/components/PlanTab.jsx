import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  Trash2, 
  Layers, 
  Flame, 
  Check,
  ArrowRight
} from 'lucide-react';

const SUGGESTIONS = [
  'Python for Data Analysis',
  'Fullstack React & Node.js',
  'Docker & Containerization',
  'Machine Learning Fundamentals',
  'System Design & Architecture',
  'FastAPI Backend Engineering'
];

export default function PlanTab({ 
  planData, 
  profileData, 
  onGeneratePlan, 
  onToggleTask, 
  onClearPlan,
  onGoToNotes,
  onGoToQuiz
}) {
  const profile = profileData?.profile || {};
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState(7);
  const [level, setLevel] = useState(profile.skill_level || 'Beginner');
  const [hours, setHours] = useState(profile.preferred_study_hours || 2);
  const [loading, setLoading] = useState(false);
  const [expandedDays, setExpandedDays] = useState({ 1: true });
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const tasks = planData?.tasks || [];
  const hasPlan = tasks.length > 0;
  const progressPercent = planData?.progress_percent || 0;
  const stats = planData?.stats || {};

  // Group tasks by day
  const tasksByDay = tasks.reduce((acc, t) => {
    acc[t.day] = acc[t.day] || [];
    acc[t.day].push(t);
    return acc;
  }, {});

  const dayNumbers = Object.keys(tasksByDay).map(Number).sort((a, b) => a - b);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!goal.trim()) return;
    setLoading(true);
    try {
      await onGeneratePlan(goal.trim(), days, level, hours);
      // Auto expand Day 1
      setExpandedDays({ 1: true });
    } catch (err) {
      alert('Error creating plan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const expandAll = () => {
    const all = {};
    dayNumbers.forEach(d => { all[d] = true; });
    setExpandedDays(all);
  };

  const collapseAll = () => {
    setExpandedDays({});
  };

  const exportMarkdown = () => {
    if (!hasPlan) return;
    let md = `# Learning Plan: ${planData.goal}\n\n`;
    md += `**Duration:** ${planData.duration_days} Days | **Progress:** ${progressPercent}% (${stats.completed_tasks}/${stats.total_tasks} tasks)\n\n`;
    dayNumbers.forEach(d => {
      md += `## Day ${d}\n`;
      tasksByDay[d].forEach(t => {
        const check = t.completed ? '[x]' : '[ ]';
        md += `- ${check} **${t.title}** (~${t.estimated_hours}h)\n  ${t.description}\n`;
      });
      md += '\n';
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${planData.goal.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-plan.md`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Creation Card */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Driven Curriculum Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Craft Your Custom Learning Path
          </h1>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Enter your topic, desired timeframe, and daily availability. The AI will construct an optimized day-by-day roadmap tailored to your skill level.
          </p>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Goal Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                What do you want to learn?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Python for Data Analysis, Microservices in Go, Prompt Engineering..."
                  className="w-full px-4 py-3.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 text-sm sm:text-base pr-10 focus:ring-2 focus:ring-indigo-500"
                />
                {goal && (
                  <button
                    type="button"
                    onClick={() => setGoal('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Suggestions chips */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Suggestions:</span>
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGoal(s)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/50 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              
              {/* Duration picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Duration</label>
                  <span className="text-xs font-bold text-indigo-400 font-mono">{days} Days</span>
                </div>
                <div className="flex items-center gap-1">
                  {[3, 5, 7, 14, 30].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        days === d
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Level picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg glass-input text-sm text-slate-200 cursor-pointer"
                >
                  <option value="Beginner" className="bg-slate-900 text-slate-200">Beginner</option>
                  <option value="Intermediate" className="bg-slate-900 text-slate-200">Intermediate</option>
                  <option value="Advanced" className="bg-slate-900 text-slate-200">Advanced</option>
                </select>
              </div>

              {/* Hours per day */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Daily Study Time</label>
                  <span className="text-xs font-bold text-indigo-400 font-mono">{hours} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !goal.trim()}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Plan with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span>Generate Structured Study Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Plan Display Section */}
      {hasPlan ? (
        <section className="space-y-6">
          {/* Plan Header Card */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-slate-850/60 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Active Plan
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {planData.duration_days} Days Total
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {planData.goal}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {stats.completed_tasks} of {stats.total_tasks} tasks completed • {stats.completed_hours} of {stats.total_hours} study hours fulfilled
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  Collapse All
                </button>
                <button
                  onClick={exportMarkdown}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/30 transition-all flex items-center gap-1.5"
                  title="Download plan as Markdown file"
                >
                  <Download className="w-3.5 h-3.5" />
                  {copiedMarkdown ? 'Exported!' : 'Export .md'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear this plan?')) {
                      onClearPlan();
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                  title="Delete current plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Plan Mastery Progress</span>
                <span className="text-emerald-400 font-mono text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Days Accordion */}
          <div className="space-y-4">
            {dayNumbers.map((day) => {
              const dayTasks = tasksByDay[day] || [];
              const dayCompleted = dayTasks.filter(t => t.completed).length;
              const isAllDone = dayTasks.length > 0 && dayCompleted === dayTasks.length;
              const isExpanded = !!expandedDays[day];

              return (
                <div 
                  key={day}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isAllDone
                      ? 'border-emerald-500/30 bg-slate-900/60'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  {/* Day Header */}
                  <button
                    type="button"
                    onClick={() => toggleDay(day)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-colors hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isAllDone
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        D{day}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                          Day {day}
                          {isAllDone && (
                            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Complete
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'} • {dayTasks.reduce((s, t) => s + t.estimated_hours, 0)} hours estimated
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                        {dayCompleted}/{dayTasks.length} done
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Day Tasks Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 divide-y divide-slate-800/60 border-t border-slate-800/60 bg-slate-900/30">
                      {dayTasks.map((t) => (
                        <div 
                          key={t.id}
                          className="py-4 first:pt-3 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
                        >
                          <div className="flex items-start gap-3.5 flex-1">
                            <button
                              type="button"
                              onClick={() => onToggleTask(t.id, !t.completed)}
                              className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                                t.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                                  : 'border-slate-600 hover:border-indigo-400 bg-slate-800/80 text-transparent'
                              }`}
                              title={t.completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className={`text-sm sm:text-base font-bold transition-all ${
                                  t.completed ? 'line-through text-slate-400' : 'text-white'
                                }`}>
                                  {t.title}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                                  <Clock className="w-3 h-3 text-indigo-400" />
                                  ~{t.estimated_hours}h
                                </span>
                              </div>
                              <p className={`text-xs sm:text-sm leading-relaxed ${
                                t.completed ? 'text-slate-500' : 'text-slate-300'
                              }`}>
                                {t.description}
                              </p>
                            </div>
                          </div>

                          {/* Quick shortcuts to Notes and Quiz */}
                          <div className="flex items-center gap-2 sm:self-center shrink-0 pl-9 sm:pl-0">
                            <button
                              type="button"
                              onClick={() => onGoToNotes(t.title)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-500 transition-all flex items-center gap-1.5"
                              title="Generate detailed study notes on this topic"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Notes</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onGoToQuiz(t.title)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/20 hover:border-purple-500 transition-all flex items-center gap-1.5"
                              title="Test your understanding with a custom quiz"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Quiz</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 glass-panel rounded-2xl border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Study Plan Active</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Enter a learning goal above and let AI generate an actionable step-by-step roadmap for you.
          </p>
          <button
            onClick={() => {
              setGoal('Python Basics & Problem Solving');
              setDays(7);
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-xl border border-indigo-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Try with "Python Basics & Problem Solving"
          </button>
        </div>
      )}

    </div>
  );
}
