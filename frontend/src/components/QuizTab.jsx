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
  AlertCircle,
  TrendingUp,
  ArrowRight
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
  const [quizData, setQuizData] = useState(null); // { topic, questions }
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [quizResult, setQuizResult] = useState(null); // result after grading

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
    if (quizResult) return; // Prevent changing after submission
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

      // Trigger celebratory confetti on good score!
      if (res.percent >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
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
      <section className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            AI Adaptive Quiz Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Assess & Validate Your Knowledge
          </h1>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Generate tailored multiple-choice challenges designed to test conceptual understanding and code reasoning.
          </p>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Topic Select */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Topic
                </label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full py-3 px-3 rounded-xl glass-input text-sm text-slate-100 cursor-pointer"
                >
                  {taskTitles.map((t, idx) => (
                    <option key={idx} value={t} className="bg-slate-900 text-slate-200">
                      Plan: {t}
                    </option>
                  ))}
                  <option value="custom" className="bg-slate-900 text-purple-300 font-semibold">
                    ✏️ Custom Topic...
                  </option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Difficulty
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full py-3 px-3 rounded-xl glass-input text-sm text-slate-100 cursor-pointer"
                >
                  <option value="Beginner" className="bg-slate-900">Beginner</option>
                  <option value="Intermediate" className="bg-slate-900">Intermediate</option>
                  <option value="Advanced" className="bg-slate-900">Advanced</option>
                </select>
              </div>

              {/* Number of questions */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Questions</label>
                  <span className="text-xs font-bold text-purple-400 font-mono">{numQuestions} Questions</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[3, 5, 8, 10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumQuestions(n)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                        numQuestions === n
                          ? 'bg-purple-600 border-purple-500 text-white font-bold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
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
                <label className="text-xs font-semibold text-slate-300">
                  Enter Custom Topic Name
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Python Decorators, React Hooks, Docker Networks..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !activeTopic.trim()}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Generating Quiz with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
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
            <div className={`p-6 sm:p-8 rounded-2xl border shadow-2xl relative overflow-hidden animate-slide-up ${
              quizResult.percent >= 80 
                ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/40' 
                : quizResult.percent >= 50
                ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-500/40'
                : 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/40'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg ${
                    quizResult.percent >= 80
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : quizResult.percent >= 50
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {quizResult.percent >= 80 ? '🏆' : quizResult.percent >= 50 ? '⭐' : '💡'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Quiz Complete • {quizResult.topic}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      Score: {quizResult.correct} / {quizResult.total} ({quizResult.percent}%)
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      {quizResult.percent >= 80 
                        ? 'Mastery achieved! Your score has been logged to your learner memory profile.' 
                        : quizResult.percent >= 50
                        ? 'Good effort! Review the explanations below to strengthen the weak spots.'
                        : 'Keep practicing! Review the notes for this topic and give it another try.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRetake}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => onGoToNotes(quizData.topic)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-600 border border-indigo-500/30 transition-all flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Review Notes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Header Info */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                📝
              </span>
              <div>
                <h3 className="font-bold text-white text-base">Quiz: {quizData.topic}</h3>
                <p className="text-xs text-slate-400">
                  {quizData.questions.length} questions • Answer all and hit submit to grade
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-mono text-purple-400 font-bold">
                {Object.keys(userAnswers).length} of {quizData.questions.length} answered
              </span>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {quizData.questions.map((q, qIdx) => {
              const selectedOpt = userAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const feedback = quizResult?.detailed?.[qIdx];

              return (
                <div 
                  key={qIdx}
                  className={`glass-panel p-6 rounded-2xl border transition-all ${
                    feedback 
                      ? feedback.is_correct 
                        ? 'border-emerald-500/40 bg-emerald-950/10' 
                        : 'border-rose-500/40 bg-rose-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Question Title */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h4 className="font-bold text-base sm:text-lg text-white leading-snug flex items-start gap-2.5">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700 mt-0.5">
                        Q{qIdx + 1}
                      </span>
                      <span>{q.question}</span>
                    </h4>

                    {feedback && (
                      <div className="shrink-0">
                        {feedback.is_correct ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      
                      let optionClasses = 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200';

                      if (feedback) {
                        const isCorrectAnswer = optIdx === feedback.correct_answer_index;
                        const isUserAnswer = optIdx === feedback.user_answer_index;

                        if (isCorrectAnswer) {
                          optionClasses = 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-semibold ring-1 ring-emerald-500';
                        } else if (isUserAnswer && !feedback.is_correct) {
                          optionClasses = 'border-rose-500 bg-rose-500/15 text-rose-300 font-semibold ring-1 ring-rose-500';
                        } else {
                          optionClasses = 'border-slate-800/50 opacity-40 text-slate-400';
                        }
                      } else if (isSelected) {
                        optionClasses = 'border-purple-500 bg-purple-500/15 text-purple-200 font-semibold ring-1 ring-purple-500';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={!!quizResult}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`w-full p-3.5 rounded-xl border text-left text-sm flex items-center justify-between gap-3 transition-all ${optionClasses}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isSelected || (feedback && optIdx === feedback.correct_answer_index)
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {optionLetters[optIdx]}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </div>

                          {feedback ? (
                            optIdx === feedback.correct_answer_index ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : optIdx === feedback.user_answer_index ? (
                              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                            ) : null
                          ) : isSelected ? (
                            <Check className="w-4 h-4 text-purple-400 shrink-0" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation card after submit */}
                  {feedback && feedback.explanation && (
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200">Explanation: </span>
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
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Grading Answers...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit & Grade Answers</span>
                  </>
                )}
              </button>
            </div>
          )}

        </section>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 glass-panel rounded-2xl border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Quiz Generated Yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Select a topic and question count above to challenge yourself with personalized AI-generated questions.
          </p>
        </div>
      )}

    </div>
  );
}
