import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  BookOpen, 
  Check, 
  AlertCircle
} from 'lucide-react';

export default function QuizTab({ 
  planData, 
  profileData, 
  initialTopic, 
  onGenerateQuiz, 
  onSubmitQuiz, 
  onGoToNotes 
}) {
  const profile = profileData?.profile || {};
  const tasks = planData?.tasks || [];
  const taskTitles = Array.from(new Set(tasks.map(t => t.title)));

  const [selectedOption, setSelectedOption] = useState(
    initialTopic || (taskTitles.length > 0 ? taskTitles[0] : 'custom')
  );
  const [customTopic, setCustomTopic] = useState(initialTopic || '');
  const [level, setLevel] = useState(profile.skill_level || 'Beginner');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active Quiz State
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    if (initialTopic) {
      if (taskTitles.includes(initialTopic)) {
        setSelectedOption(initialTopic);
      } else {
        setSelectedOption('custom');
        setCustomTopic(initialTopic);
      }
    }
  }, [initialTopic, taskTitles]);

  const activeTopic = selectedOption === 'custom' ? customTopic : selectedOption;

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!activeTopic.trim()) return;

    setLoading(true);
    setQuizResult(null);
    setUserAnswers({});
    try {
      const res = await onGenerateQuiz(activeTopic.trim(), level, numQuestions);
      setQuizData(res);
    } catch (err) {
      alert('Failed to generate quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (quizResult) return;
    setUserAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmit = async () => {
    if (!quizData) return;
    const questions = quizData.questions;
    const formattedAnswers = questions.map((_, idx) => 
      userAnswers[idx] !== undefined ? userAnswers[idx] : null
    );

    const unansweredCount = formattedAnswers.filter(a => a === null).length;
    if (unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await onSubmitQuiz(quizData.topic, formattedAnswers, questions);
      setQuizResult(res);

      if (res.percent >= 70) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#ec4899', '#22c55e', '#eab308', '#a855f7'],
        });
      }
    } catch (err) {
      alert('Failed to submit quiz: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setQuizResult(null);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Generator Card */}
      <section className="glass-panel p-6 sm:p-9 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white via-purple-50/20 to-pink-50/25 border border-slate-200/90 shadow-lg shadow-purple-500/5">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs mb-3.5">
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            AI Adaptive Quiz Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Assess & Cement Your Understanding
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 mb-6 font-normal leading-relaxed">
            Generate custom multiple-choice challenges with instant grading, in-depth explanations, and memory retention logging.
          </p>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Topic Select */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs sm:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Topic
                </label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 cursor-pointer focus:ring-2 focus:ring-purple-200"
                >
                  {taskTitles.map((t, idx) => (
                    <option key={idx} value={t}>
                      Plan: {t}
                    </option>
                  ))}
                  <option value="custom" className="text-purple-600 font-bold">
                    ✏️ Custom Topic...
                  </option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Difficulty
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 cursor-pointer focus:ring-2 focus:ring-purple-200"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Number of questions */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Questions</label>
                  <span className="text-xs font-black text-purple-600 font-mono">{numQuestions} Questions</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[3, 5, 8, 10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumQuestions(n)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        numQuestions === n
                          ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Custom Topic Input */}
            {selectedOption === 'custom' && (
              <div className="space-y-1.5 animate-slide-up">
                <label className="text-xs font-bold text-slate-700">
                  Enter Custom Topic Name
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Python Decorators, React Hooks, Docker Networks..."
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:ring-4 focus:ring-purple-100"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !activeTopic.trim()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 group"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Quiz with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span>Generate AI Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Active Quiz or Results Display */}
      {quizData ? (
        <section className="space-y-6">
          
          {/* Result Banner if submitted */}
          {quizResult && (
            <div className={`p-6 sm:p-9 rounded-3xl border shadow-xl relative overflow-hidden animate-slide-up ${
              quizResult.percent >= 80 
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-300' 
                : quizResult.percent >= 50
                ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-white border-indigo-300'
                : 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-md ${
                    quizResult.percent >= 80
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : quizResult.percent >= 50
                      ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                      : 'bg-amber-500 text-white shadow-amber-500/20'
                  }`}>
                    {quizResult.percent >= 80 ? '🏆' : quizResult.percent >= 50 ? '⭐' : '💡'}
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Quiz Completed • {quizResult.topic}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                      Score: {quizResult.correct} / {quizResult.total} ({quizResult.percent}%)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                      {quizResult.percent >= 80 
                        ? 'Mastery unlocked! This high score has been logged to your learner profile.' 
                        : quizResult.percent >= 50
                        ? 'Solid comprehension! Check out the explanations below for tricky nuances.'
                        : 'Great practice session! Review the study notes and give it another shot.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRetake}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => onGoToNotes(quizData.topic)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Review Notes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Header Bar */}
          <div className="glass-panel p-5 rounded-3xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shadow-2xs">
                📝
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Quiz: {quizData.topic}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {quizData.questions.length} questions • Select an option for each question and submit
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-mono text-purple-700 font-black bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                {Object.keys(userAnswers).length} / {quizData.questions.length} answered
              </span>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {quizData.questions.map((q, qIdx) => {
              const selectedOpt = userAnswers[qIdx];
              const feedback = quizResult?.detailed?.[qIdx];

              return (
                <div 
                  key={qIdx}
                  className={`glass-panel p-6 sm:p-7 rounded-3xl border transition-all shadow-xs ${
                    feedback 
                      ? feedback.is_correct 
                        ? 'border-emerald-300 bg-emerald-50/20' 
                        : 'border-rose-300 bg-rose-50/20'
                      : 'border-slate-200/90 bg-white'
                  }`}
                >
                  {/* Question Title */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <h4 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug flex items-start gap-3">
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0 mt-0.5 shadow-2xs">
                        Q{qIdx + 1}
                      </span>
                      <span>{q.question}</span>
                    </h4>

                    {feedback && (
                      <div className="shrink-0">
                        {feedback.is_correct ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-300 shadow-2xs">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorrect
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      
                      let optionClasses = 'border-slate-200/90 bg-slate-50/70 hover:bg-slate-100 text-slate-800';

                      if (feedback) {
                        const isCorrectAnswer = optIdx === feedback.correct_answer_index;
                        const isUserAnswer = optIdx === feedback.user_answer_index;

                        if (isCorrectAnswer) {
                          optionClasses = 'border-emerald-500 bg-emerald-100 text-emerald-950 font-bold ring-2 ring-emerald-300 shadow-xs';
                        } else if (isUserAnswer && !feedback.is_correct) {
                          optionClasses = 'border-rose-400 bg-rose-100 text-rose-950 font-bold ring-2 ring-rose-200';
                        } else {
                          optionClasses = 'border-slate-200 opacity-40 text-slate-400';
                        }
                      } else if (isSelected) {
                        optionClasses = 'border-purple-500 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-200 shadow-xs';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={!!quizResult}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`w-full p-4 rounded-2xl border text-left text-sm flex items-center justify-between gap-3 transition-all ${optionClasses}`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                              isSelected || (feedback && optIdx === feedback.correct_answer_index)
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}>
                              {optionLetters[optIdx]}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </div>

                          {feedback ? (
                            optIdx === feedback.correct_answer_index ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            ) : optIdx === feedback.user_answer_index ? (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            ) : null
                          ) : isSelected ? (
                            <Check className="w-4 h-4 text-purple-600 stroke-[3] shrink-0" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation card after submit */}
                  {feedback && feedback.explanation && (
                    <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs sm:text-sm text-indigo-950 leading-relaxed flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-indigo-900">Why this is correct: </span>
                        <span>{feedback.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          {!quizResult && (
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Grading Answers...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit & Grade Quiz</span>
                  </>
                )}
              </button>
            </div>
          )}

        </section>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-slate-200/90 bg-white shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">No Quiz Generated Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Select a topic and question count above to challenge yourself with personalized AI-generated questions.
          </p>
        </div>
      )}

    </div>
  );
}
