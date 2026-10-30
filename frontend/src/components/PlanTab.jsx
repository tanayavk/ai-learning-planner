import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  Trash2, 
  Layers, 
  Check,
  Compass,
  ArrowRight
} from 'lucide-react';

const SUGGESTIONS = [
  { text: 'Python for Data Analysis', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { text: 'Fullstack React & Node.js', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { text: 'Docker & Kubernetes', color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
  { text: 'Machine Learning Foundations', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { text: 'System Design & Scalability', color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' },
  { text: 'FastAPI Backend Engineering', color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
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
      
      {/* Top Creation Hero Card */}
      <section className="glass-panel p-6 sm:p-9 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 border border-slate-200/90 shadow-lg shadow-indigo-500/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-200/25 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI-Driven Curriculum Planner
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Design Your Personalized Learning Journey
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 mb-6 font-normal leading-relaxed">
            Tell the AI what you want to master. We'll generate a day-by-day roadmap with realistic workloads, curated milestones, and targeted exercises.
          </p>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Goal Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                What skill or topic do you want to learn?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Python for Data Analysis, Microservices in Go, Prompt Engineering..."
                  className="w-full px-4 py-3.5 rounded-2xl glass-input text-slate-900 placeholder-slate-400 text-sm sm:text-base pr-10 shadow-xs focus:ring-4 focus:ring-indigo-100"
                />
                {goal && (
                  <button
                    type="button"
                    onClick={() => setGoal('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Suggestions colorful chips */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  Quick Ideas:
                </span>
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGoal(s.text)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all duration-150 shadow-2xs hover:scale-105 active:scale-95 ${s.color}`}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              
              {/* Duration picker */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Duration</label>
                  <span className="text-xs font-black text-indigo-600 font-mono">{days} Days</span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  {[3, 5, 7, 14, 30].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        days === d
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Level picker */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <label className="text-xs font-bold text-slate-700 block">Target Depth</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 cursor-pointer focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Beginner">Beginner (Foundational)</option>
                  <option value="Intermediate">Intermediate (Practical)</option>
                  <option value="Advanced">Advanced (Deep Dive)</option>
                </select>
              </div>

              {/* Hours per day */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Daily Study Target</label>
                  <span className="text-xs font-black text-indigo-600 font-mono">{hours} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                />
              </div>

            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !goal.trim()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-indigo-200/80 bg-white shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs">
                    ACTIVE PLAN
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {planData.duration_days} Days Scheduled
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {planData.goal}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  <span className="text-emerald-600 font-bold">{stats.completed_tasks}</span> of {stats.total_tasks} tasks completed • <span className="text-indigo-600 font-bold">{stats.completed_hours}</span> of {stats.total_hours} study hours fulfilled
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={expandAll}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  Collapse All
                </button>
                <button
                  onClick={exportMarkdown}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white bg-indigo-50 border border-indigo-200 transition-all flex items-center gap-1.5 shadow-2xs"
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
                  className="p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Delete current plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Curriculum Mastery</span>
                <span className="text-emerald-600 font-mono text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-xs"
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
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    isAllDone
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200/90 bg-white hover:border-indigo-200'
                  }`}
                >
                  {/* Day Header */}
                  <button
                    type="button"
                    onClick={() => toggleDay(day)}
                    className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left transition-colors hover:bg-slate-50/60"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shadow-xs ${
                        isAllDone
                          ? 'bg-emerald-500 text-white'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}>
                        D{day}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                          Day {day}
                          {isAllDone && (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
                              <Check className="w-3 h-3 stroke-[3]" /> Completed
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'} • {dayTasks.reduce((s, t) => s + t.estimated_hours, 0)} hours planned
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono font-bold hidden sm:inline">
                        {dayCompleted}/{dayTasks.length} done
                      </span>
                      <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Day Tasks Body */}
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-1 divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/40">
                      {dayTasks.map((t) => (
                        <div 
                          key={t.id}
                          className="py-4 first:pt-3 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
                        >
                          <div className="flex items-start gap-3.5 flex-1">
                            <button
                              type="button"
                              onClick={() => onToggleTask(t.id, !t.completed)}
                              className={`mt-0.5 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                                t.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                                  : 'border-slate-300 hover:border-indigo-500 bg-white text-transparent'
                              }`}
                              title={t.completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className={`text-sm sm:text-base font-bold transition-all ${
                                  t.completed ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}>
                                  {t.title}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Clock className="w-3 h-3 text-indigo-500" />
                                  ~{t.estimated_hours}h
                                </span>
                              </div>
                              <p className={`text-xs sm:text-sm leading-relaxed ${
                                t.completed ? 'text-slate-400' : 'text-slate-600'
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
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 transition-all flex items-center gap-1.5 shadow-2xs"
                              title="Generate comprehensive study notes on this topic"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Notes</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onGoToQuiz(t.title)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-purple-600 transition-all flex items-center gap-1.5 shadow-2xs"
                              title="Test your understanding with a tailored quiz"
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
        <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-slate-200/90 bg-white">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">No Study Plan Active</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Enter a learning goal above and let Groq AI generate an actionable step-by-step roadmap for you.
          </p>
          <button
            onClick={() => {
              setGoal('Python Basics & Problem Solving');
              setDays(7);
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-2xl border border-indigo-200 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Try with "Python Basics & Problem Solving"
          </button>
        </div>
      )}

    </div>
  );
}
