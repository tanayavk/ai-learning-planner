import React, { useState } from 'react';
import { 
  X, 
  User, 
  Award, 
  Clock, 
  BookCheck, 
  RotateCcw, 
  Trash2, 
  Check
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
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' 
    },
    { 
      name: 'Intermediate', 
      desc: 'Solid foundations, ready for practical application and real-world patterns',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' 
    },
    { 
      name: 'Advanced', 
      desc: 'Deep dives, architectural decisions, performance optimization and edge cases',
      badge: 'bg-purple-100 text-purple-800 border-purple-300' 
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
      }, 700);
    } catch (e) {
      alert('Failed to update profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Learner Profile & Preferences</h2>
              <p className="text-xs text-slate-500 font-medium">Fine-tune your learning speed and skill level for AI customization</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Stats overview cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center shadow-2xs">
              <BookCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-slate-900 font-mono">{stats.completed_topics_count || 0}</div>
              <div className="text-[11px] font-bold text-emerald-800">Mastered Topics</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center shadow-2xs">
              <Award className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-slate-900 font-mono">{stats.average_quiz_score ? `${stats.average_quiz_score}%` : 'N/A'}</div>
              <div className="text-[11px] font-bold text-amber-800">Quiz Average</div>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-center shadow-2xs">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-slate-900 font-mono">{stats.preferred_study_hours || 2}h</div>
              <div className="text-[11px] font-bold text-indigo-800">Daily Target</div>
            </div>
          </div>

          {/* Skill Level Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Skill Tier</label>
            <div className="grid grid-cols-1 gap-2.5">
              {levels.map((lvl) => {
                const isSelected = skillLevel === lvl.name;
                return (
                  <button
                    key={lvl.name}
                    type="button"
                    onClick={() => setSkillLevel(lvl.name)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-200 shadow-xs' 
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        {lvl.name}
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{lvl.desc}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-indigo-600 stroke-[3] shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Study Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Daily Study Target</label>
              <span className="font-black font-mono text-indigo-600 text-base">{studyHours} hours / day</span>
            </div>
            <input 
              type="range"
              min="1"
              max="12"
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-bold font-mono">
              <span>1 hr</span>
              <span>4 hrs</span>
              <span>8 hrs</span>
              <span>12 hrs</span>
            </div>
          </div>

          {/* Mastered topics list */}
          {profile.completed_topics && profile.completed_topics.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Completed Topics ({profile.completed_topics.length})</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {profile.completed_topics.map((t, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reset Actions / Data control */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset your profile learning history and scores?')) {
                    onResetProfile();
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 shadow-2xs"
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
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Plan
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-xs font-black bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
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
