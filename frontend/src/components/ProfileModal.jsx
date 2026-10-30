import React, { useState } from 'react';
import { 
  X, 
  User, 
  Award, 
  Clock, 
  BookCheck, 
  Sparkles, 
  RotateCcw, 
  Trash2,
  Check,
  AlertTriangle
} from 'lucide-react';

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  profileData, 
  onUpdateProfile, 
  onResetProfile, 
  onClearPlan 
}) {
  if (!isOpen) return null;

  const profile = profileData?.profile || {};
  const stats = profileData?.stats || {};

  const [skillLevel, setSkillLevel] = useState(profile.skill_level || 'Beginner');
  const [studyHours, setStudyHours] = useState(profile.preferred_study_hours || 2);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const levels = [
    { 
      name: 'Beginner', 
      desc: 'No prior experience, step-by-step fundamentals and gentle pacing',
      color: 'border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-400' 
    },
    { 
      name: 'Intermediate', 
      desc: 'Good fundamentals, ready for deeper patterns and practical building',
      color: 'border-indigo-500/50 bg-indigo-500/5 hover:border-indigo-400' 
    },
    { 
      name: 'Advanced', 
      desc: 'Deep dives, architectural decisions, performance and edge cases',
      color: 'border-purple-500/50 bg-purple-500/5 hover:border-purple-400' 
    },
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdateProfile({
        skill_level: skillLevel,
        preferred_study_hours: parseInt(studyHours, 10),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 800);
    } catch (e) {
      alert('Failed to update profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Learner Profile & Preferences</h2>
              <p className="text-xs text-slate-400">Configure your learning profile for personalized AI recommendations</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Stats overview cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
              <BookCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.completed_topics_count || 0}</div>
              <div className="text-[11px] text-slate-400">Topics Mastered</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.average_quiz_score ? `${stats.average_quiz_score}%` : 'N/A'}</div>
              <div className="text-[11px] text-slate-400">Quiz Average</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
              <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.preferred_study_hours || 2} hrs</div>
              <div className="text-[11px] text-slate-400">Daily Target</div>
            </div>
          </div>

          {/* Skill Level Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Current Skill Level</label>
            <div className="grid grid-cols-1 gap-2.5">
              {levels.map((lvl) => {
                const isSelected = skillLevel === lvl.name;
                return (
                  <button
                    key={lvl.name}
                    type="button"
                    onClick={() => setSkillLevel(lvl.name)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50' 
                        : 'border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center gap-2">
                        {lvl.name}
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{lvl.desc}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Study Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label className="font-semibold text-slate-200">Daily Study Target</label>
              <span className="font-bold font-mono text-indigo-400 text-base">{studyHours} hours / day</span>
            </div>
            <input 
              type="range"
              min="1"
              max="12"
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>1 hr</span>
              <span>4 hrs</span>
              <span>8 hrs</span>
              <span>12 hrs</span>
            </div>
          </div>

          {/* Mastered topics list preview */}
          {profile.completed_topics && profile.completed_topics.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Completed Topics ({profile.completed_topics.length})</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                {profile.completed_topics.map((t, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reset Actions / Data control */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset your profile learning history and scores?')) {
                    onResetProfile();
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear the current study plan?')) {
                    onClearPlan();
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Plan
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/60 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
