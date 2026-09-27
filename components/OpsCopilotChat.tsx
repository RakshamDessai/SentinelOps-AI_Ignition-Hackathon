'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IncidentScenario, ChatMessage } from '@/lib/types';
import { X, Send, Bot, User, Copy, Check, MessageSquareCode } from 'lucide-react';

interface CopilotProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: IncidentScenario;
}

export const OpsCopilotChat: React.FC<CopilotProps> = ({
  isOpen,
  onClose,
  scenario
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      content: `Hello! I am **SentinelOps Copilot**, your real-time incident intelligence assistant. 

Monitoring active incident: **${scenario.title}**. 
Current failure probability is **${scenario.prediction.probability}%** with **${Math.round(scenario.prediction.timeToFailureSec / 60)} minutes** until full exhaustion.

How can I assist your investigation?`,
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Why did this failure occur?',
    'What is the immediate mitigation command?',
    'Show me database queries & lock status',
    'Explain the code fix in the PR'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toTimeString().split(' ')[0]
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          scenario,
          chatHistory: messages.map((m) => ({ sender: m.sender, content: m.content }))
        })
      });

      if (!res.ok) throw new Error('Copilot response failed');

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: data.answer,
        timestamp: new Date().toTimeString().split(' ')[0]
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        content: 'Apologies, I encountered an error connecting to the reasoning pipeline. Please try again.',
        timestamp: new Date().toTimeString().split(' ')[0]
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-fade-in transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-600 dark:text-white shadow-xs">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>SentinelOps Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive SRE Incident Assistant
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 bg-slate-50/40 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono block mb-1.5">
          Quick Investigations:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs font-medium"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-sans text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white dark:bg-sky-600'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-lg p-3 space-y-1.5 ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white dark:bg-sky-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed text-[11px]">
                {msg.content}
              </div>

              {msg.sender === 'assistant' && (
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/60">
                  <span>{msg.timestamp}</span>
                  <button
                    onClick={() => copyText(msg.id, msg.content)}
                    className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1 font-mono"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs pl-9">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            <span>Querying telemetry signals & reasoning...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about root causes, rollback commands, queries..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-600 dark:hover:bg-sky-500 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
