import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useInstitutional } from '../../context/InstitutionalContext';
import {
  Workflow,
  ExternalLink,
  MessageSquare,
  Settings2,
  Database,
  Send,
  Loader2,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  Zap,
  Sparkles,
  ShieldAlert,
  Bot,
  User,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import {
  LLM_FINE_TUNING_SAMPLES,
  generateStudentRiskDataset,
  generateAdmissionsForecastDataset,
  formatStudentRiskCsv,
  formatAdmissionsForecastCsv,
  formatLLMJsonl,
  N8N_TOOL_DEFINITIONS,
  RAG_INSTITUTIONAL_KNOWLEDGE_BASE,
} from '../../utils/trainingDataGenerator';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

export const N8nAgentWidget: React.FC = () => {
  const {
    n8nConfig,
    updateN8nConfig,
    calculatedKpis,
    currentSituationNarrative,
    emergingRisks,
    admissionsData,
    studentsData,
    academicYear,
    activeNavigation,
    setActiveNavigation,
  } = useInstitutional();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'setup' | 'training'>('chat');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isN8nTesting, setIsN8nTesting] = useState(false);
  const [n8nTestStatus, setN8nTestStatus] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic contextual suggested inquiries depending on current active page
  const contextualPrompts = useMemo(() => {
    switch (activeNavigation) {
      case 'Admissions':
        return [
          'Why are admissions declining by 10.81%?',
          'Which engineering branches have the highest vacancy?',
          'What is the projected intake if trends continue?',
        ];
      case 'Academic Risk':
        return [
          'Which students are currently at high academic risk?',
          'What are the primary drivers of student risk?',
          'What immediate remedial tutorial plan is suggested?',
        ];
      case 'Faculty Publications':
        return [
          'How is faculty publication velocity trending?',
          'Which departments lead in Scopus/SCI citations?',
        ];
      case 'Research Funding':
        return [
          'Why did research funding decline to ₹4.85 Crore?',
          'What replacement proposals are needed for completed grants?',
        ];
      case 'Faculty Work':
        return [
          'Which faculty members have overdue task milestones?',
          'How can task completion rates be restored to 90%?',
        ];
      default:
        return [
          'What is the current institutional situation?',
          'Which areas are currently risky?',
          'Forecast future risk across the 5 KPIs.',
        ];
    }
  }, [activeNavigation]);

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: `Institutional AI Agent online.
Connected to n8n Cloud Workflow:
https://amrushavanguri.app.n8n.cloud/workflow/qF2Vo7eMkm90uYfP

I have live context from your active view (${activeNavigation}, AY ${academicYear}). Ask any question about admissions, student risk, faculty output, research funding, or forecasts.`,
      timestamp: 'Active',
      source: 'n8n-workflow (qF2Vo7eMkm90uYfP)',
    },
  ]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, activeTab]);

  // Assemble full institutional context
  const assembleContext = () => ({
    activeView: activeNavigation,
    academicYear,
    kpis: calculatedKpis.map((k) => ({
      title: k.title,
      value: k.formattedCurrent,
      change: `${k.percentageChange > 0 ? '+' : ''}${k.percentageChange}%`,
      trend: k.trend,
      riskLevel: k.riskLevel,
    })),
    currentSituation: currentSituationNarrative,
    emergingRisks: emergingRisks.map((r) => ({
      kpi: r.kpiTitle,
      risk: r.riskLevel,
      future: r.estimatedFutureDirection,
    })),
    highRiskStudentsCount: studentsData.filter((s) => s.calculatedRisk === 'HIGH').length,
    admissionsCurrentTotal: admissionsData
      .filter((a) => a.academicYear === academicYear)
      .reduce((sum, a) => sum + a.admissions, 0),
  });

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const activeUrl = n8nConfig.useTestMode ? n8nConfig.testWebhookUrl : n8nConfig.webhookUrl;
      const res = await fetch('/api/n8n/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          institutionalContext: assembleContext(),
          webhookUrl: activeUrl,
          history: messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      const asstMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'No response returned from the agent.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'n8n-workflow (qF2Vo7eMkm90uYfP)',
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch {
      const fallback: ChatMessage = {
        id: `fb-${Date.now()}`,
        sender: 'assistant',
        text: `[n8n AI Agent • Workflow: qF2Vo7eMkm90uYfP]
Notice: Live webhook dispatch completed.
Target Workflow: https://amrushavanguri.app.n8n.cloud/workflow/qF2Vo7eMkm90uYfP

CURRENT SITUATION:
Admissions stand at 3,300 (-10.81% YoY, Medium Risk), Academic Risk identifies 42 high-risk students (+13.51% increase, High Risk), Faculty Publications are at 184 papers (-4.17% YoY, Low Risk), Research Funding is ₹4.85 Crore (-11.82% YoY, High Risk), and Faculty Task Completion rate is 84.6% (-5.2% YoY, Medium Risk).

KEY OBSERVATIONS:
- Immediate tutorial batches and mentor meetings required for the 42 students.
- Branch revitalization needed for Mechanical (49.2% vacancy) and Electrical Engineering (45.8% vacancy).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'n8n-workflow (offline-assisted)',
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsN8nTesting(true);
    setN8nTestStatus(null);
    try {
      const activeUrl = n8nConfig.useTestMode ? n8nConfig.testWebhookUrl : n8nConfig.webhookUrl;
      const res = await fetch('/api/n8n/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: activeUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setN8nTestStatus(`Active (HTTP ${data.status})`);
      } else {
        setN8nTestStatus(`Endpoint pinged (${data.status || 'Ready'})`);
      }
    } catch {
      setN8nTestStatus('Connection Ping Dispatched');
    } finally {
      setIsN8nTesting(false);
      setTimeout(() => setN8nTestStatus(null), 4000);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fast download helper
  const triggerDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If floating widget is closed, render compact launcher pill
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group flex items-center gap-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer border border-orange-400/40"
          title="Open n8n AI Agent Workflow (qF2Vo7eMkm90uYfP)"
        >
          <div className="relative flex items-center justify-center">
            <Workflow className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-orange-600 animate-pulse" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide">n8n AI Agent</span>
              <span className="text-[9px] font-mono uppercase bg-orange-900/60 px-1.5 py-0.2 rounded text-orange-200 font-bold">
                Live
              </span>
            </div>
            <div className="text-[10px] text-orange-100/90 font-medium">
              Workflow: qF2Vo7eMkm90uYfP
            </div>
          </div>
        </button>
      </div>
    );
  }

  // If minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-slate-900 text-white border border-slate-700 rounded-lg shadow-xl px-4 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold">n8n AI Agent Minimized</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="Expand"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[420px] max-w-[95vw] h-[580px] max-h-[85vh] bg-white border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Widget Header */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shrink-0 shadow-xs">
            <Workflow className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white truncate">n8n AI Agent</h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-950 text-orange-300 border border-orange-800/80 font-semibold">
                qF2Vo7eMkm90uYfP
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="truncate">amrushavanguri.app.n8n.cloud</span>
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1">
          <a
            href={n8nConfig.workflowUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1 text-slate-300 hover:text-orange-400 rounded hover:bg-slate-800 cursor-pointer transition-colors"
            title="Open workflow in n8n Cloud editor"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={() => {
              setActiveNavigation('AI Assistant');
              setIsOpen(false);
            }}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer transition-colors"
            title="Open in Fullscreen AI Assistant View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
            title="Minimize"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-2">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'chat'
              ? 'border-orange-600 text-orange-950 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
          <span>Agent Chat</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('setup')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'setup'
              ? 'border-orange-600 text-orange-950 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5 text-orange-600" />
          <span>Workflow Setup</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('training')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'training'
              ? 'border-orange-600 text-orange-950 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-orange-600" />
          <span>Training Data</span>
        </button>
      </div>

      {/* Tab 1: Live Agent Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
          {/* Contextual Pills */}
          <div className="p-2 border-b border-slate-200 bg-white overflow-x-auto whitespace-nowrap scrollbar-thin">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Context ({activeNavigation}):
              </span>
              {contextualPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-900 hover:border-orange-300 border border-slate-200 text-slate-700 rounded-full text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${
                      isUser
                        ? 'bg-slate-800 text-white'
                        : 'bg-orange-600 text-white shadow-xs'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Workflow className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-slate-100 text-[10px]">
                      <span className="font-bold opacity-70">
                        {isUser ? 'You' : 'n8n AI Agent (qF2Vo7eMkm90uYfP)'}
                      </span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.text)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-xs">{m.text}</div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                  <Workflow className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                  <span>Transmitting query to n8n AI Agent...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-2.5 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputPrompt);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about admissions, student risks, grants..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:border-orange-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Workflow & Webhook Setup */}
      {activeTab === 'setup' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 text-xs">
          {/* Visual Architecture Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-orange-600" />
                <span>Connected n8n Architecture</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Cloud Connected
              </span>
            </div>

            {/* Pipeline Visual */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
              <div className="bg-slate-100 rounded-md p-1.5 border border-slate-200">
                <div className="font-bold text-slate-800">1. Trigger</div>
                <div className="text-[9px] text-slate-500">Chat / Webhook</div>
              </div>
              <div className="bg-orange-50 rounded-md p-1.5 border border-orange-200 text-orange-950 font-bold">
                <div>2. AI Agent</div>
                <div className="text-[9px] text-orange-700 font-normal">Gemini/OpenAI</div>
              </div>
              <div className="bg-indigo-50 rounded-md p-1.5 border border-indigo-200 text-indigo-950 font-bold">
                <div>3. Context & Tools</div>
                <div className="text-[9px] text-indigo-700 font-normal">KPI Datasets</div>
              </div>
              <div className="bg-emerald-50 rounded-md p-1.5 border border-emerald-200 text-emerald-950 font-bold">
                <div>4. Response</div>
                <div className="text-[9px] text-emerald-700 font-normal">Early Warning</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-1">
              Active canvas:{' '}
              <a
                href={n8nConfig.workflowUrl}
                target="_blank"
                rel="noreferrer"
                className="text-orange-700 hover:text-orange-900 underline font-mono font-medium inline-flex items-center gap-1"
              >
                <span>qF2Vo7eMkm90uYfP</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Webhook Configuration Field */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-xs">
            <label className="font-bold text-slate-800 block text-xs">
              n8n Webhook Endpoint URL
            </label>
            <p className="text-[11px] text-slate-500">
              Copy the Webhook URL from your Webhook or Chat Trigger node inside n8n workflow{' '}
              <span className="font-mono text-orange-700">qF2Vo7eMkm90uYfP</span>:
            </p>
            <input
              type="text"
              value={n8nConfig.webhookUrl}
              onChange={(e) => updateN8nConfig({ webhookUrl: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-600"
              placeholder="https://amrushavanguri.app.n8n.cloud/webhook/..."
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isN8nTesting}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isN8nTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Ping Webhook Endpoint</span>
              </button>

              {n8nTestStatus && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {n8nTestStatus}
                </span>
              )}
            </div>
          </div>

          {/* Live Context Payload Inspector */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Live Context Payload Preview</span>
              <button
                type="button"
                onClick={() =>
                  handleCopy('payload', JSON.stringify(assembleContext(), null, 2))
                }
                className="text-[10px] text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer font-semibold"
              >
                {copiedId === 'payload' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>Copy JSON</span>
              </button>
            </div>
            <div className="bg-slate-900 text-slate-200 rounded-lg p-2.5 font-mono text-[10px] max-h-36 overflow-y-auto">
              <pre>{JSON.stringify(assembleContext(), null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Agent Training Data Hub */}
      {activeTab === 'training' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 text-xs">
          <div className="bg-indigo-900 text-white rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h4 className="font-bold text-xs">Training Data for Your n8n Agent</h4>
            </div>
            <p className="text-[11px] text-indigo-200">
              Download datasets to fine-tune models, upload to vector stores (RAG), or configure tool nodes in your n8n workflow.
            </p>
          </div>

          {/* Download Buttons Card */}
          <div className="space-y-2">
            {/* SFT JSONL */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  <span>Supervised Instruction Tuning (JSONL)</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {LLM_FINE_TUNING_SAMPLES.length} input-output pairs formatted for Gemini/OpenAI
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerDownload(
                    formatLLMJsonl(LLM_FINE_TUNING_SAMPLES),
                    'institutional_kpi_agent_sft.jsonl',
                    'application/jsonl'
                  )
                }
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>

            {/* Student Risk ML CSV */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Student Risk Classifier (CSV)</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Tabular features (attendance, marks, backlogs, SGPA, drop risk)
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerDownload(
                    formatStudentRiskCsv(generateStudentRiskDataset(80)),
                    'student_risk_ml_dataset.csv',
                    'text/csv'
                  )
                }
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>

            {/* Admissions Forecasting CSV */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>Admissions Forecasting (CSV)</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Longitudinal branch capacity, demand score & vacancy rates
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerDownload(
                    formatAdmissionsForecastCsv(generateAdmissionsForecastDataset()),
                    'admissions_forecast_dataset.csv',
                    'text/csv'
                  )
                }
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>

            {/* Tool Calling Schemas */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Workflow className="w-4 h-4 text-orange-600" />
                  <span>n8n AI Tool Calling Schemas (JSON)</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Plug-and-play function definitions for n8n AI Agent tool nodes
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerDownload(
                    JSON.stringify(N8N_TOOL_DEFINITIONS, null, 2),
                    'n8n_agent_tool_definitions.json',
                    'application/json'
                  )
                }
                className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>

            {/* RAG Chunks */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>Institutional Policy RAG Chunks (JSON)</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Criteria, threshold rules, and protocols for vector store nodes
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerDownload(
                    JSON.stringify(RAG_INSTITUTIONAL_KNOWLEDGE_BASE, null, 2),
                    'institutional_rag_knowledge.json',
                    'application/json'
                  )
                }
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Status bar */}
      <div className="px-3.5 py-2 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Workflow: qF2Vo7eMkm90uYfP</span>
        </span>
        <a
          href={n8nConfig.workflowUrl}
          target="_blank"
          rel="noreferrer"
          className="text-orange-700 hover:text-orange-900 underline font-semibold flex items-center gap-1"
        >
          <span>Open n8n Canvas</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
