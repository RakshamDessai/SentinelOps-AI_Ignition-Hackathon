'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IncidentScenario, ChatMessage } from '@/lib/types';
import { X, Send, Bot, User, Sparkles, Terminal, Copy, Check, MessageSquareCode, ShieldAlert } from 'lucide-react';

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

I'm monitoring the active incident: **${scenario.title}**. 
Current failure probability is **${scenario.prediction.probability}%** with **${Math.round(scenario.prediction.timeToFailureSec / 60)} minutes** remaining before service degradation.

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
    'Show me the database queries and lock status',
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>SentinelOps SRE Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive Autonomous Incident Responder
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Quick Investigations:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-sky-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-xl p-3 space-y-1.5 ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {msg.sender === 'assistant' && (
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60">
                  <span>{msg.timestamp}</span>
                  <button
                    onClick={() => copyText(msg.id, msg.content)}
                    className="hover:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
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
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>Querying cross-stack telemetry & LLM reasoning...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
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
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
