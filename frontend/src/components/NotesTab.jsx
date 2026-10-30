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
  BookMarked, 
  Clock, 
  Share2
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

  // Helper to render markdown text gracefully
  const renderFormattedMarkdown = (rawText) => {
    if (!rawText) return null;

    // Split text by lines and parse markdown structures
    const lines = rawText.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    let currentKey = 0;

    lines.forEach((line) => {
      currentKey++;

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // close code block
          elements.push(
            <div key={`code-${currentKey}`} className="my-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              <div className="bg-slate-900/90 px-4 py-1.5 text-xs text-slate-400 font-mono flex items-center justify-between border-b border-slate-800">
                <span className="flex items-center gap-1.5"><Code className="w-3.5 h-3.5 text-indigo-400" /> Code Snippet</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(codeBuffer.join('\n'))}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
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

      // Headers
      if (line.startsWith('## ')) {
        const title = line.replace('## ', '').trim();
        let icon = <BookMarked className="w-5 h-5 text-indigo-400" />;
        let bannerStyle = "text-white border-l-4 border-indigo-500 pl-3";

        if (title.toLowerCase().includes('mistake')) {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          bannerStyle = "text-amber-200 border-l-4 border-amber-500 pl-3";
        } else if (title.toLowerCase().includes('example')) {
          icon = <Code className="w-5 h-5 text-emerald-400" />;
          bannerStyle = "text-emerald-200 border-l-4 border-emerald-500 pl-3";
        } else if (title.toLowerCase().includes('exercise')) {
          icon = <CheckCircle className="w-5 h-5 text-purple-400" />;
          bannerStyle = "text-purple-200 border-l-4 border-purple-500 pl-3";
        }

        elements.push(
          <div key={`h2-${currentKey}`} className="pt-6 pb-2 first:pt-2">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${bannerStyle}`}>
              {icon}
              <span>{title}</span>
            </h3>
          </div>
        );
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${currentKey}`} className="text-xl sm:text-2xl font-black text-white pt-4 pb-2">
            {line.replace('# ', '')}
          </h2>
        );
        return;
      }

      // Bullet lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.replace(/^[-*]\s+/, '');
        elements.push(
          <div key={`li-${currentKey}`} className="flex items-start gap-2.5 my-1.5 pl-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
            <p className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
          </div>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={`sp-${currentKey}`} className="h-2" />);
        return;
      }

      // Normal paragraph
      elements.push(
        <p 
          key={`p-${currentKey}`} 
          className="text-slate-300 text-sm leading-relaxed my-2"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
        />
      );
    });

    return elements;
  };

  // Helper for bold and inline code
  const formatInlineMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-800 text-indigo-300 border border-slate-700/60">$1</code>');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Generator Card */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Comprehensive Study Notes Generator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Topic Master Notes & Explanations
          </h1>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Get structured, crystal-clear summaries featuring key concepts, worked code examples, pitfall warnings, and practical exercises.
          </p>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Topic Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Select Topic
                </label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full py-3 px-3.5 rounded-xl glass-input text-sm text-slate-100 cursor-pointer"
                >
                  {taskTitles.map((t, idx) => (
                    <option key={idx} value={t} className="bg-slate-900 text-slate-200">
                      Plan: {t}
                    </option>
                  ))}
                  <option value="custom" className="bg-slate-900 text-indigo-300 font-semibold">
                    ✏️ Custom Topic...
                  </option>
                </select>
              </div>

              {/* Skill level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Skill Depth
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full py-3 px-3.5 rounded-xl glass-input text-sm text-slate-100 cursor-pointer"
                >
                  <option value="Beginner" className="bg-slate-900">Beginner (Foundational)</option>
                  <option value="Intermediate" className="bg-slate-900">Intermediate (Practical)</option>
                  <option value="Advanced" className="bg-slate-900">Advanced (Deep Dive)</option>
                </select>
              </div>

            </div>

            {/* Custom Topic Input if selected */}
            {selectedOption === 'custom' && (
              <div className="space-y-1.5 animate-slide-up">
                <label className="text-xs font-semibold text-slate-300">
                  Enter Custom Topic Name
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Asynchronous Programming in Python, CSS Grid vs Flexbox..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !activeTopic.trim()}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Writing Notes with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
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
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
          
          {/* Header of notes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentNotes.level} Level
                </span>
                <span className="text-xs text-slate-400">
                  Generated at {currentNotes.timestamp}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentNotes.topic}
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download .md
              </button>
              <button
                onClick={() => onGoToQuiz(currentNotes.topic)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Test with Quiz
              </button>
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <div className="prose prose-invert max-w-none space-y-1">
            {renderFormattedMarkdown(currentNotes.content)}
          </div>

          {/* Footer Call to action */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Finished reviewing these notes? Solidify your memory with a quiz.
            </span>
            <button
              onClick={() => onGoToQuiz(currentNotes.topic)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Take Quiz on "{currentNotes.topic}" →
            </button>
          </div>

        </section>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 glass-panel rounded-2xl border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Notes Generated Yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Choose any topic from your study plan or type any technical subject to receive concise, high-yield study material.
          </p>
        </div>
      )}

    </div>
  );
}
