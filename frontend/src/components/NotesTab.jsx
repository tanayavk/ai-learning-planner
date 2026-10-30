import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  HelpCircle, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  BookMarked
} from 'lucide-react';

export default function NotesTab({ 
  planData, 
  profileData, 
  initialTopic, 
  onGenerateNotes, 
  onGoToQuiz 
}) {
  const profile = profileData?.profile || {};
  const tasks = planData?.tasks || [];
  const taskTitles = Array.from(new Set(tasks.map(t => t.title)));

  const [selectedOption, setSelectedOption] = useState(
    initialTopic || (taskTitles.length > 0 ? taskTitles[0] : 'custom')
  );
  const [customTopic, setCustomTopic] = useState(initialTopic || '');
  const [level, setLevel] = useState(profile.skill_level || 'Beginner');
  const [loading, setLoading] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(null);
  const [copied, setCopied] = useState(false);

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
    try {
      const res = await onGenerateNotes(activeTopic.trim(), level);
      setCurrentNotes({
        topic: res.topic,
        level: res.level,
        content: res.content,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      alert('Failed to generate notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentNotes?.content) return;
    navigator.clipboard.writeText(currentNotes.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentNotes?.content) return;
    const blob = new Blob([currentNotes.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNotes.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render formatted markdown with colorful callout cards
  const renderFormattedMarkdown = (rawText) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    let currentKey = 0;

    lines.forEach((line) => {
      currentKey++;

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${currentKey}`} className="my-5 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
              <div className="bg-slate-950 px-4 py-2 text-xs text-slate-400 font-mono flex items-center justify-between border-b border-slate-800">
                <span className="flex items-center gap-2 text-slate-300 font-bold">
                  <Code className="w-3.5 h-3.5 text-emerald-400" /> Worked Code Example
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(codeBuffer.join('\n'))}
                  className="text-[11px] text-slate-400 hover:text-white font-medium transition-colors"
                >
                  Copy code
                </button>
              </div>
              <pre className="p-4 text-xs sm:text-sm text-emerald-300 font-mono overflow-x-auto leading-relaxed">
                {codeBuffer.join('\n')}
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headers with colorful themed banners
      if (line.startsWith('## ')) {
        const title = line.replace('## ', '').trim();
        let icon = <BookMarked className="w-5 h-5 text-indigo-600" />;
        let bannerStyle = "bg-indigo-50 border-l-4 border-indigo-600 text-indigo-950";

        if (title.toLowerCase().includes('mistake') || title.toLowerCase().includes('pitfall')) {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
          bannerStyle = "bg-amber-50 border-l-4 border-amber-500 text-amber-950";
        } else if (title.toLowerCase().includes('example')) {
          icon = <Code className="w-5 h-5 text-emerald-600" />;
          bannerStyle = "bg-emerald-50 border-l-4 border-emerald-600 text-emerald-950";
        } else if (title.toLowerCase().includes('exercise')) {
          icon = <CheckCircle className="w-5 h-5 text-purple-600" />;
          bannerStyle = "bg-purple-50 border-l-4 border-purple-600 text-purple-950";
        }

        elements.push(
          <div key={`h2-${currentKey}`} className="pt-6 pb-2 first:pt-1">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl ${bannerStyle}`}>
              {icon}
              <span>{title}</span>
            </h3>
          </div>
        );
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${currentKey}`} className="text-xl sm:text-2xl font-black text-slate-900 pt-4 pb-2">
            {line.replace('# ', '')}
          </h2>
        );
        return;
      }

      // Bullet items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.replace(/^[-*]\s+/, '');
        elements.push(
          <div key={`li-${currentKey}`} className="flex items-start gap-3 my-2 pl-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-xs" />
            <p className="text-slate-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
          </div>
        );
        return;
      }

      // Spacing
      if (!line.trim()) {
        elements.push(<div key={`sp-${currentKey}`} className="h-2" />);
        return;
      }

      // Standard text
      elements.push(
        <p 
          key={`p-${currentKey}`} 
          className="text-slate-700 text-sm sm:text-base leading-relaxed my-2.5 font-normal"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
        />
      );
    });

    return elements;
  };

  const formatInlineMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">$1</code>');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Generator Card */}
      <section className="glass-panel p-6 sm:p-9 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/25 border border-slate-200/90 shadow-lg shadow-emerald-500/5">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs mb-3.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            Structured Study Notes Generator
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            High-Yield Master Notes & Code Walkthroughs
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 mb-6 font-normal leading-relaxed">
            Generate clean, concise, expert study notes with bullet points, code examples, pitfall warnings, and self-test exercises.
          </p>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Topic Select */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Select Topic
                </label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-200"
                >
                  {taskTitles.map((t, idx) => (
                    <option key={idx} value={t}>
                      Plan: {t}
                    </option>
                  ))}
                  <option value="custom" className="text-indigo-600 font-bold">
                    ✏️ Custom Topic...
                  </option>
                </select>
              </div>

              {/* Skill level */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Skill Depth
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="Beginner">Beginner (Foundational)</option>
                  <option value="Intermediate">Intermediate (Practical)</option>
                  <option value="Advanced">Advanced (Deep Dive)</option>
                </select>
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
                  placeholder="e.g. Asynchronous Programming in Python, CSS Grid vs Flexbox..."
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !activeTopic.trim()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 group"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Writing Notes with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span>Generate Topic Notes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Render Notes Section */}
      {currentNotes ? (
        <section className="glass-panel p-6 sm:p-9 rounded-3xl border border-slate-200/90 bg-white shadow-xl space-y-6">
          
          {/* Header of notes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {currentNotes.level} Tier
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Generated at {currentNotes.timestamp}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentNotes.topic}
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .md
              </button>
              <button
                onClick={() => onGoToQuiz(currentNotes.topic)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Take Quiz
              </button>
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <div className="prose max-w-none space-y-1">
            {renderFormattedMarkdown(currentNotes.content)}
          </div>

          {/* Footer Call to action */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500">
              Finished reviewing these notes? Test your comprehension right away.
            </span>
            <button
              onClick={() => onGoToQuiz(currentNotes.topic)}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl border border-purple-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              Start Quiz on "{currentNotes.topic}" →
            </button>
          </div>

        </section>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-slate-200/90 bg-white shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">No Notes Generated Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Choose any topic from your study plan or type any technical subject to receive concise, high-yield study material.
          </p>
        </div>
      )}

    </div>
  );
}
