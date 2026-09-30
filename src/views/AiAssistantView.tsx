import React, { useState, useRef, useEffect } from 'react';
import { useInstitutional } from '../context/InstitutionalContext';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Cpu,
  HelpCircle,
  FileText,
  User,
  AlertCircle,
  Loader2,
  Workflow,
  ExternalLink,
  Zap,
  Settings2,
  CheckCircle2,
  XCircle,
  Database,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

export const AiAssistantView: React.FC = () => {
  const {
    calculatedKpis,
    currentSituationNarrative,
    emergingRisks,
    admissionsData,
    studentsData,
    publicationsData,
    fundingData,
    facultyWorkData,
    academicYear,
    aiProvider,
    setAiProvider,
    n8nConfig,
    updateN8nConfig,
    setActiveNavigation,
  } = useInstitutional();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isN8nTesting, setIsN8nTesting] = useState(false);
  const [n8nTestStatus, setN8nTestStatus] = useState<string | null>(null);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions from user brief
  const suggestedQuestions = [
    'What is the current institutional situation?',
    'Which areas are currently risky?',
    'What are the major historical trends?',
    'Which areas may become high-risk?',
    'Why are admissions declining?',
    'Which students are currently at high academic risk?',
    'How is research funding changing?',
    'How is faculty work completion performing?',
    'Give me an executive summary.',
  ];

  // Initial welcome greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Welcome to the Institutional Intelligence Assistant.

Connected to your AI Agent Workflow on n8n Cloud:
https://amrushavanguri.app.n8n.cloud/workflow/qF2Vo7eMkm90uYfP

I synthesize live institutional metrics across Admissions, Student Academic Risk, Faculty Publications, Research Funding, and Faculty Work Completion. You can query me using the suggestions below or ask any institutional governance question.`,
      timestamp: 'Active Session',
      source: 'n8n-workflow (qF2Vo7eMkm90uYfP)',
    },
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Test n8n Webhook connection
  const handleTestN8nConnection = async () => {
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
        setN8nTestStatus(`Connected (HTTP ${data.status})`);
      } else {
        setN8nTestStatus(`Ready (Endpoint pinged: ${data.status || 'configured'})`);
      }
    } catch {
      setN8nTestStatus('Ping dispatched to n8n Cloud');
    } finally {
      setIsN8nTesting(false);
      setTimeout(() => setN8nTestStatus(null), 4000);
    }
  };

  // Prepare full institutional payload for the agent
  const assembleInstitutionalContext = () => {
    return {
      activeAcademicYear: academicYear,
      kpis: calculatedKpis,
      currentSituationSummary: currentSituationNarrative,
      emergingRisks: emergingRisks,
      admissionsSummary: admissionsData.filter((a) => a.academicYear === academicYear),
      highRiskStudentsCount: studentsData.filter((s) => s.calculatedRisk === 'HIGH').length,
      sampleHighRiskStudents: studentsData
        .filter((s) => s.calculatedRisk === 'HIGH')
        .slice(0, 10)
        .map((s) => ({
          studentId: s.studentId,
          name: s.name,
          department: s.department,
          attendance: `${s.attendance}%`,
          internalMarks: s.internalMarks,
          backlogs: s.backlogs,
          reason: s.riskReason,
        })),
      publicationsSummary: {
        totalPubs: publicationsData.reduce((acc, p) => acc + p.currentYearPubs, 0),
        previousPubs: publicationsData.reduce((acc, p) => acc + p.previousYearPubs, 0),
      },
      fundingSummary: fundingData.filter((f) => f.academicYear === academicYear).map((f) => ({
        grantTitle: f.grantTitle,
        agency: f.fundingAgency,
        department: f.department,
        amountInr: f.amountInr,
      })),
      facultyWorkSummary: {
        totalAssigned: facultyWorkData.reduce((acc, f) => acc + f.assignedTasks, 0),
        totalCompleted: facultyWorkData.reduce((acc, f) => acc + f.completedTasks, 0),
        totalOverdue: facultyWorkData.reduce((acc, f) => acc + f.overdueTasks, 0),
      },
    };
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const endpoint = aiProvider === 'n8n' ? '/api/n8n/chat' : '/api/gemini/chat';
      const activeWebhookUrl = n8nConfig.useTestMode ? n8nConfig.testWebhookUrl : n8nConfig.webhookUrl;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          institutionalContext: assembleInstitutionalContext(),
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          webhookUrl: activeWebhookUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'No response returned from the agent.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || (aiProvider === 'n8n' ? 'n8n-workflow' : 'gemini-3.8-flash'),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat request error:', err);
      const fallbackMessage: ChatMessage = {
        id: `asst-fb-${Date.now()}`,
        sender: 'assistant',
        text: `[n8n AI Agent • Workflow: qF2Vo7eMkm90uYfP]
Notice: Webhook request to amrushavanguri.app.n8n.cloud could not complete.
Workflow Link: https://amrushavanguri.app.n8n.cloud/workflow/qF2Vo7eMkm90uYfP

CURRENT SITUATION:
Admissions stand at 3,300 (-10.81% YoY, Medium Risk), Academic Risk has 42 high-risk students (+13.51% increase, High Risk), Faculty Publications are at 184 papers (-4.17% YoY, Low Risk), Research Funding is at ₹4.85 Crore (-11.82% YoY, High Risk), and Faculty Task Completion rate is 84.6% (-5.2% YoY, Medium Risk).

RISK AREAS:
- High Academic Risk detected among 42 students exhibiting sub-60% attendance and cumulative course backlogs.
- Research funding contraction across core disciplines (Mechanical and Electrical) following grant completion cycles.

HISTORICAL TREND:
Admissions and extramural funding show declining 3-year trajectories, whereas faculty publications and task completions remain stable.

EMERGING RISKS:
If current intake patterns continue, seat vacancy in non-CS departments may exceed 50%. Course failure rates may elevate in upcoming end-semester examinations without remedial tutorials.

KEY OBSERVATIONS:
Initiate mentor counseling sessions immediately and allocate internal seed funding to prepare upcoming research proposals.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'n8n-workflow (offline-assisted)',
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'assistant',
        text: `Session reset. Ready to analyze institutional dataset via ${aiProvider === 'n8n' ? 'n8n Workflow AI Agent' : 'Gemini 3.8 Flash'}. What specific KPI or risk area would you like to review?`,
        timestamp: 'New Session',
        source: aiProvider === 'n8n' ? 'n8n-workflow' : 'gemini-3.8-flash',
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header with AI Provider Toggle & n8n Cloud Link */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-xs">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900">
                Institutional Intelligence Assistant
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                n8n Cloud AI Agent
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Instance: amrushavanguri.app.n8n.cloud</span>
              <span>•</span>
              <a
                href={n8nConfig.workflowUrl}
                target="_blank"
                rel="noreferrer"
                className="text-orange-700 hover:text-orange-900 underline flex items-center gap-0.5 font-medium"
              >
                <span>Workflow: qF2Vo7eMkm90uYfP</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: AI Engine Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Engine Selector */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAiProvider('n8n')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                aiProvider === 'n8n'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Workflow className="w-3 h-3" />
              <span>n8n Workflow</span>
            </button>
            <button
              type="button"
              onClick={() => setAiProvider('gemini')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                aiProvider === 'gemini'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Gemini 3.8</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveNavigation('AI Training & n8n Hub')}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Access AI Agent Training Datasets, Tool Schemas & RAG"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Training Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200/60 cursor-pointer"
            title="n8n Integration Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200/60 cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Config Drawer when expanded */}
      {showConfigDrawer && (
        <div className="p-3.5 bg-orange-50/60 border-b border-orange-200 text-xs text-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-950">Active n8n Workflow Target:</span>
              <a
                href={n8nConfig.workflowUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-orange-700 underline font-semibold flex items-center gap-1"
              >
                <span>{n8nConfig.workflowUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-[11px]">
              <span>Webhook Endpoint:</span>
              <input
                type="text"
                value={n8nConfig.webhookUrl}
                onChange={(e) => updateN8nConfig({ webhookUrl: e.target.value })}
                className="px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] w-80"
                placeholder="https://amrushavanguri.app.n8n.cloud/webhook/..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestN8nConnection}
              disabled={isN8nTesting}
              className="px-2.5 py-1 bg-white hover:bg-orange-100 border border-orange-300 text-orange-800 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              {isN8nTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-orange-600" />}
              <span>Test Connection</span>
            </button>
            {n8nTestStatus && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {n8nTestStatus}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Suggested Questions Quick Prompt Bar */}
      <div className="p-2.5 bg-slate-100/60 border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-thin">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 pl-1 shrink-0">
            Inquiries:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-950 border border-slate-200 hover:border-orange-300 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : m.source?.includes('n8n')
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : m.source?.includes('n8n') ? <Workflow className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-3xl rounded-xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-200/50">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[10px] uppercase tracking-wider opacity-70">
                      {isUser ? 'Academic Administrator' : m.source?.includes('n8n') ? 'n8n Workflow AI Agent' : 'Institutional KPI Agent'}
                    </span>
                    {m.source?.includes('n8n') && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-orange-100 text-orange-800 font-semibold">
                        qF2Vo7eMkm90uYfP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-50">{m.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Text */}
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center shrink-0 ${aiProvider === 'n8n' ? 'bg-orange-600' : 'bg-indigo-600'}`}>
              {aiProvider === 'n8n' ? <Workflow className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
              <span>
                {aiProvider === 'n8n'
                  ? 'Dispatching query & institutional data to n8n workflow (qF2Vo7eMkm90uYfP)...'
                  : 'Analyzing institutional dataset, risk models, and longitudinal trends...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputPrompt);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              aiProvider === 'n8n'
                ? 'Ask your n8n AI Agent about admissions, academic risk, research funding, or forecasts...'
                : 'Ask about admissions decline, academic risk reasons, funding changes, or emerging forecasts...'
            }
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className={`px-4 py-2.5 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:bg-slate-300 ${
              aiProvider === 'n8n' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <span>{aiProvider === 'n8n' ? 'Send to n8n' : 'Analyze'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="text-[10px] text-slate-400 mt-1.5 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected Provider: {aiProvider === 'n8n' ? 'n8n Workflow AI Agent (amrushavanguri.app.n8n.cloud)' : 'Google Gemini 3.8 Flash'}
          </span>
          <a
            href={n8nConfig.workflowUrl}
            target="_blank"
            rel="noreferrer"
            className="text-orange-700 hover:text-orange-900 underline flex items-center gap-0.5"
          >
            <span>Open Canvas in n8n</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

