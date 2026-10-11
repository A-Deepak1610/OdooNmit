import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
  Code2,
} from 'lucide-react';
import { apiClient } from '../../services/api-client';

interface Interaction {
  id: string;
  question: string;
  correctedQuestion?: string;
  answer?: string;
  sql?: string;
  isLoading?: boolean;
  error?: string | null;
  timestamp: Date;
}

const SUGGESTED_QUERIES = [
  'How many users are registered?',
  'List all active student clubs',
  'Show unresolved high priority support tickets',
  'How many total votes have been cast in elections?',
  'List upcoming campus events and venues',
];

export const AdminDbAssistantPage: React.FC = () => {
  const [queryInput, setQueryInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [expandedSql, setExpandedSql] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new interaction is added
  useEffect(() => {
    if (interactions.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [interactions]);

  const toggleSql = (id: string) => {
    setExpandedSql((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopySql = async (sql: string, id: string) => {
    if (!sql) return;
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback if clipboard API fails
      const el = document.createElement('textarea');
      el.value = sql;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const executeQuery = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isExecuting) return;

    const interactionId = `query_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newInteraction: Interaction = {
      id: interactionId,
      question: trimmed,
      isLoading: true,
      timestamp: new Date(),
    };

    // Append to interactions history
    setInteractions((prev) => [...prev, newInteraction]);
    setQueryInput('');
    setIsExecuting(true);

    try {
      let resultData: {
        question: string;
        original_question?: string;
        corrected_question?: string;
        sql: string;
        answer: string;
      } | null = null;

      // 1. Try direct connection to Python SQL Chatbot on port 8001
      try {
        const response = await fetch('http://localhost:8001/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: trimmed }),
        });

        if (response.ok) {
          resultData = await response.json();
        } else {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.detail || `Server returned HTTP ${response.status}`);
        }
      } catch (directErr: any) {
        // 2. Fallback to Express backend proxy
        try {
          const proxyRes = await apiClient.post('/admin/db-assistant', { query: trimmed });
          if (proxyRes.data?.data) {
            const data = proxyRes.data.data;
            resultData = {
              question: data.query,
              original_question: data.originalQuery || trimmed,
              corrected_question: data.correctedQuery || data.query,
              sql: data.sqlQuery || '',
              answer: data.interpretedIntent || 'Query executed successfully.',
            };
          } else {
            throw directErr;
          }
        } catch {
          throw directErr;
        }
      }

      if (!resultData) {
        throw new Error('No response received from DB Query Assistant.');
      }

      setInteractions((prev) =>
        prev.map((item) =>
          item.id === interactionId
            ? {
                ...item,
                isLoading: false,
                answer: resultData!.answer || 'No natural language response provided.',
                sql: resultData!.sql || '',
                correctedQuestion:
                  resultData!.corrected_question ||
                  (resultData!.question !== item.question ? resultData!.question : undefined),
              }
            : item
        )
      );
    } catch (err: any) {
      setInteractions((prev) =>
        prev.map((item) =>
          item.id === interactionId
            ? {
                ...item,
                isLoading: false,
                error:
                  err.message ||
                  'Failed to connect to the query assistant. Please ensure the server is running.',
              }
            : item
        )
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeQuery(queryInput);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Description */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          DB Query Assistant
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Ask questions about your campus data in natural language.
        </p>
      </div>

      {/* 2. Query Input Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  executeQuery(queryInput);
                }
              }}
              placeholder="Ask a question about your database (e.g., How many users are registered?)"
              disabled={isExecuting}
              className="w-full h-11 px-4 rounded-xl border border-slate-300 font-medium text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isExecuting || !queryInput.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <span>Run Query</span>
            )}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Suggested:
          </span>
          {SUGGESTED_QUERIES.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => executeQuery(suggestion)}
              disabled={isExecuting}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-600 transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Conversation & Response History */}
      {interactions.length > 0 ? (
        <div className="space-y-6">
          {interactions.map((item) => (
            <div key={item.id} className="space-y-3">
              {/* User Question */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Your question
                </span>
                <div className="bg-slate-100/90 rounded-xl px-4 py-3 border border-slate-200 text-sm font-medium text-slate-900">
                  {item.question}
                </div>
                {item.correctedQuestion &&
                  item.correctedQuestion.trim().toLowerCase() !==
                    item.question.trim().toLowerCase() && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-700">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Corrected via Groq: &ldquo;{item.correctedQuestion}&rdquo;</span>
                    </div>
                  )}
              </div>

              {/* Assistant Response */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Assistant response
                </span>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  {item.isLoading ? (
                    <div className="flex items-center gap-3 text-slate-500 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span className="text-sm font-medium">
                        Refining query spelling with Groq & retrieving database schema...
                      </span>
                    </div>
                  ) : item.error ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                      <p className="font-semibold mb-0.5">Query Notice</p>
                      <p className="text-xs text-amber-800">{item.error}</p>
                    </div>
                  ) : (
                    <>
                      {/* Natural Language Answer */}
                      <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                        {item.answer}
                      </div>

                      {/* Collapsible Generated SQL Panel */}
                      {item.sql && (
                        <div className="pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleSql(item.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                              <Code2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Generated SQL</span>
                              {expandedSql[item.id] ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>

                            {expandedSql[item.id] && (
                              <button
                                type="button"
                                onClick={() => handleCopySql(item.sql!, item.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600 font-semibold">
                                      Copied SQL
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Copy SQL</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {expandedSql[item.id] && (
                            <div className="mt-3 rounded-xl bg-slate-900 border border-slate-800 p-4 overflow-x-auto text-slate-200">
                              <pre className="font-mono text-xs text-sky-300 leading-relaxed whitespace-pre-wrap break-all">
                                {item.sql}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      ) : null}
    </div>
  );
};
