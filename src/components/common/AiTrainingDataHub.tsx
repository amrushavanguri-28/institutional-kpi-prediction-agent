import React, { useState } from 'react';
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
import {
  Download,
  Copy,
  Check,
  FileCode,
  FileSpreadsheet,
  BrainCircuit,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  Terminal,
  Workflow,
  ExternalLink,
  Database,
  Zap,
} from 'lucide-react';

export const AiTrainingDataHub: React.FC = () => {
  const [hubTab, setHubTab] = useState<
    'llm' | 'student_ml' | 'admissions_ml' | 'n8n_tools' | 'rag' | 'guide'
  >('llm');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const studentMlData = React.useMemo(() => generateStudentRiskDataset(60), []);
  const admissionsMlData = React.useMemo(() => generateAdmissionsForecastDataset(), []);

  // Download triggers
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadLLMJsonl = () => {
    const jsonl = formatLLMJsonl(LLM_FINE_TUNING_SAMPLES);
    downloadFile(jsonl, 'institutional_kpi_agent_sft_train.jsonl', 'application/jsonl');
  };

  const handleDownloadStudentCsv = () => {
    const csv = formatStudentRiskCsv(studentMlData);
    downloadFile(csv, 'student_academic_risk_ml_train.csv', 'text/csv');
  };

  const handleDownloadAdmissionsCsv = () => {
    const csv = formatAdmissionsForecastCsv(admissionsMlData);
    downloadFile(csv, 'admissions_forecasting_train.csv', 'text/csv');
  };

  const handleDownloadN8nToolsJson = () => {
    downloadFile(
      JSON.stringify(N8N_TOOL_DEFINITIONS, null, 2),
      'n8n_agent_tool_definitions.json',
      'application/json'
    );
  };

  const handleDownloadRagJson = () => {
    downloadFile(
      JSON.stringify(RAG_INSTITUTIONAL_KNOWLEDGE_BASE, null, 2),
      'institutional_policy_rag_knowledge.json',
      'application/json'
    );
  };

  const handleCopySample = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-xl p-5 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              AI Agent Training & Knowledge Foundry
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Institutional AI Datasets for Training & n8n Workflows</span>
            <span className="text-[10px] font-mono bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-800">
              qF2Vo7eMkm90uYfP
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Export ready-to-use supervised instruction-tuning pairs (JSONL) for Gemini/LLMs, high-density ML tabular datasets (CSV), n8n AI Agent tool definitions, and RAG knowledge base chunks.
          </p>
        </div>

        {/* Action Download Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadLLMJsonl}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSONL (LLM)</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadStudentCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Student Risk CSV</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadN8nToolsJson}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>n8n Tools JSON</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs overflow-x-auto whitespace-nowrap scrollbar-thin">
        <button
          type="button"
          onClick={() => setHubTab('llm')}
          className={`pb-2.5 font-bold transition-colors border-b-2 cursor-pointer ${
            hubTab === 'llm'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          1. LLM Fine-Tuning Pairs (JSONL)
        </button>
        <button
          type="button"
          onClick={() => setHubTab('student_ml')}
          className={`pb-2.5 font-bold transition-colors border-b-2 cursor-pointer ${
            hubTab === 'student_ml'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Student Risk ML Classifier (CSV)
        </button>
        <button
          type="button"
          onClick={() => setHubTab('admissions_ml')}
          className={`pb-2.5 font-bold transition-colors border-b-2 cursor-pointer ${
            hubTab === 'admissions_ml'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Admissions Forecasting Model (CSV)
        </button>
        <button
          type="button"
          onClick={() => setHubTab('n8n_tools')}
          className={`pb-2.5 font-bold transition-colors border-b-2 cursor-pointer ${
            hubTab === 'n8n_tools'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          4. n8n Agent Tools (JSON Schemas)
        </button>
        <button
          type="button"
          onClick={() => setHubTab('rag')}
          className={`pb-2.5 font-bold transition-colors border-b-2 cursor-pointer ${
            hubTab === 'rag'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          5. Institutional RAG Knowledge (JSON)
        </button>
        <button
          type="button"
          onClick={() => setHubTab('guide')}
          className={`pb-2.5 font-bold transition-colors border-b-2 cursor-pointer ${
            hubTab === 'guide'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          6. Training & n8n Integration Guide
        </button>
      </div>

      {/* Tab 1: LLM Fine-Tuning (JSONL) */}
      {hubTab === 'llm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing <strong>{LLM_FINE_TUNING_SAMPLES.length} Curated SFT Instruction Examples</strong> (System Prompt + User Prompt + Structured Institutional Target)
            </span>
            <button
              type="button"
              onClick={handleDownloadLLMJsonl}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full JSONL File</span>
            </button>
          </div>

          <div className="space-y-4">
            {LLM_FINE_TUNING_SAMPLES.map((sample, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs"
              >
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">
                      Instruction Tuning Scenario: {sample.messages[1].content.split('\n')[0].replace('Institutional Context:', 'Executive Overview').replace('Admissions Context:', 'Admissions Variance').replace('Student Academic Risk Data:', 'Academic Risk Cohort').replace('Research Funding Context:', 'Funding Contraction').replace('Faculty Work Context:', 'Task Delay Mitigation')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySample(`sample-${idx}`, JSON.stringify(sample, null, 2))}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                    title="Copy sample JSON"
                  >
                    {copiedId === `sample-${idx}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="p-4 space-y-3 font-mono text-[11px] leading-relaxed">
                  {/* User Question */}
                  <div className="p-3 bg-slate-100/70 rounded-md border border-slate-200 text-slate-800">
                    <span className="font-bold text-slate-500 block mb-1 font-sans text-xs">
                      [USER PROMPT & DATA CONTEXT]
                    </span>
                    <div className="whitespace-pre-wrap">{sample.messages[1].content}</div>
                  </div>

                  {/* Target Response */}
                  <div className="p-3 bg-indigo-50/50 rounded-md border border-indigo-100 text-indigo-950">
                    <span className="font-bold text-indigo-700 block mb-1 font-sans text-xs">
                      [TARGET AGENT RESPONSE — 5-SECTION STANDARD]
                    </span>
                    <div className="whitespace-pre-wrap">{sample.messages[2].content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Student Risk Tabular Dataset */}
      {hubTab === 'student_ml' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <div>
              <strong>Supervised Classification Matrix:</strong> 60 synthetic records with 12 input features and 3 target labels (RiskLevel, DropoutProbabilityPct, RemedialRequiredFlag).
            </div>
            <button
              type="button"
              onClick={handleDownloadStudentCsv}
              className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download student_risk_ml_train.csv</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2">StudentID</th>
                    <th className="p-2">Dept</th>
                    <th className="p-2">Sem</th>
                    <th className="p-2">Attendance%</th>
                    <th className="p-2">Internals</th>
                    <th className="p-2">Midterm</th>
                    <th className="p-2">LabAttn%</th>
                    <th className="p-2">Backlogs</th>
                    <th className="p-2">PriorSGPA</th>
                    <th className="p-2">TARGET: Risk</th>
                    <th className="p-2">TARGET: Dropout%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {studentMlData.map((row) => (
                    <tr key={row.student_id} className="hover:bg-slate-50/70">
                      <td className="p-2 font-bold text-slate-900">{row.student_id}</td>
                      <td className="p-2 text-slate-700">{row.department}</td>
                      <td className="p-2">{row.semester}</td>
                      <td className="p-2 font-semibold">{row.attendance_pct}%</td>
                      <td className="p-2">{row.internal_marks_100}/100</td>
                      <td className="p-2">{row.midterm_score_50}/50</td>
                      <td className="p-2">{row.lab_attendance_pct}%</td>
                      <td className="p-2 font-bold">{row.cumulative_backlogs}</td>
                      <td className="p-2">{row.prior_semester_sgpa}</td>
                      <td className="p-2 font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            row.risk_level === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : row.risk_level === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {row.risk_level}
                        </span>
                      </td>
                      <td className="p-2 font-semibold text-slate-800">{row.dropout_probability_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Admissions Forecasting Tabular Dataset */}
      {hubTab === 'admissions_ml' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <div>
              <strong>Time-Series & Branch Regression Matrix:</strong> 30 departmental longitudinal records (2021-22 to 2025-26) with placement indices and vacancy targets.
            </div>
            <button
              type="button"
              onClick={handleDownloadAdmissionsCsv}
              className="text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download admissions_forecasting_train.csv</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2">AcademicYear</th>
                    <th className="p-2">Department</th>
                    <th className="p-2">Applications</th>
                    <th className="p-2">SanctionedSeats</th>
                    <th className="p-2">PlacementIndex</th>
                    <th className="p-2">IndustryDemand</th>
                    <th className="p-2">TARGET: Admissions</th>
                    <th className="p-2">TARGET: Vacancy%</th>
                    <th className="p-2">TARGET: Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {admissionsMlData.map((row) => (
                    <tr key={row.record_id} className="hover:bg-slate-50/70">
                      <td className="p-2 font-bold text-slate-900">{row.academic_year}</td>
                      <td className="p-2 font-semibold text-indigo-700">{row.department}</td>
                      <td className="p-2">{row.applications_received.toLocaleString()}</td>
                      <td className="p-2">{row.available_capacity}</td>
                      <td className="p-2">{row.regional_placement_index}/100</td>
                      <td className="p-2">{row.industry_demand_score}/100</td>
                      <td className="p-2 font-bold text-slate-900">{row.target_admissions}</td>
                      <td className="p-2 font-bold">
                        <span className={row.target_vacancy_pct > 25 ? 'text-rose-600' : 'text-emerald-700'}>
                          {row.target_vacancy_pct}%
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.target_risk_category === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : row.target_risk_category === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {row.target_risk_category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: n8n Agent Tool Calling Schemas (JSON) */}
      {hubTab === 'n8n_tools' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              <strong>{N8N_TOOL_DEFINITIONS.length} Pre-built Tool / Function Calling Schemas</strong> for n8n AI Agent nodes.
            </span>
            <button
              type="button"
              onClick={handleDownloadN8nToolsJson}
              className="text-orange-700 hover:text-orange-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Tools JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {N8N_TOOL_DEFINITIONS.map((tool) => (
              <div
                key={tool.name}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-orange-100 text-orange-800 font-bold flex items-center justify-center font-mono text-[11px]">
                      fn
                    </span>
                    <h4 className="font-mono font-bold text-slate-900 text-xs">{tool.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySample(tool.name, JSON.stringify(tool, null, 2))}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy schema"
                  >
                    {copiedId === tool.name ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{tool.description}</p>

                {/* Schema preview */}
                <div className="bg-slate-900 rounded-lg p-2.5 text-slate-200 font-mono text-[10px] max-h-36 overflow-y-auto">
                  <pre>{JSON.stringify(tool.parameters, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Institutional Policy RAG Knowledge (JSON) */}
      {hubTab === 'rag' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              <strong>{RAG_INSTITUTIONAL_KNOWLEDGE_BASE.length} Regulatory & Criteria Chunks</strong> ready for n8n Vector Store / Pinecone / Qdrant.
            </span>
            <button
              type="button"
              onClick={handleDownloadRagJson}
              className="text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export RAG JSON</span>
            </button>
          </div>

          <div className="space-y-3">
            {RAG_INSTITUTIONAL_KNOWLEDGE_BASE.map((chunk) => (
              <div
                key={chunk.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                      {chunk.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{chunk.topic}</h4>
                    <span className="text-[10px] text-slate-400">({chunk.category})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySample(chunk.id, chunk.content)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy chunk"
                  >
                    {copiedId === chunk.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed font-sans text-xs whitespace-pre-line border border-slate-200/60">
                  {chunk.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Guide & Implementation Snippets */}
      {hubTab === 'guide' && (
        <div className="space-y-5 text-xs">
          {/* n8n Workflow Direct Integration Guide */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-bold text-orange-950">
                  Connecting to n8n Cloud Workflow: qF2Vo7eMkm90uYfP
                </h3>
              </div>
              <a
                href="https://amrushavanguri.app.n8n.cloud/workflow/qF2Vo7eMkm90uYfP"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Open Canvas in n8n</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-orange-900 leading-relaxed">
              Your institutional web application is configured to transmit queries and institutional metrics directly to your workflow on <strong>amrushavanguri.app.n8n.cloud</strong>. Follow these simple steps inside your n8n workflow canvas:
            </p>

            <ol className="list-decimal list-inside space-y-2 text-slate-800 bg-white/80 p-3.5 rounded-lg border border-orange-200">
              <li>
                <strong>Trigger Node:</strong> Add a <em>Chat Trigger</em> or <em>Webhook</em> node in n8n. Set the HTTP Method to <code>POST</code>.
              </li>
              <li>
                <strong>AI Agent Node:</strong> Connect the trigger to an <em>AI Agent</em> node with an LLM Model (e.g. Gemini 3.8 Flash, OpenAI GPT-4o, or Anthropic Claude).
              </li>
              <li>
                <strong>System Prompt:</strong> Paste the system prompt from the <strong>LLM Fine-Tuning tab</strong> above so the agent knows to answer using <code>CURRENT SITUATION</code>, <code>RISK AREAS</code>, <code>HISTORICAL TREND</code>, and <code>EMERGING RISKS</code>.
              </li>
              <li>
                <strong>Tools / Knowledge:</strong> Add a <em>Tool</em> node and import the <strong>n8n Agent Tools JSON</strong> schemas from Tab 4, or attach an <em>In-Memory Vector Store</em> with the RAG Chunks from Tab 5.
              </li>
              <li>
                <strong>Webhook Response:</strong> Connect the agent output to the Webhook response. In the website settings or floating widget, enter your Webhook URL (e.g., <code>https://amrushavanguri.app.n8n.cloud/webhook/qF2Vo7eMkm90uYfP/chat</code>).
              </li>
            </ol>
          </div>

          {/* Section 1: LLM Fine-Tuning Instructions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-700" />
              <h3 className="text-sm font-bold text-slate-900">
                1. Fine-Tuning Your LLM Agent (Gemini / Claude / OpenAI)
              </h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Use the downloaded <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700 font-bold">institutional_kpi_agent_sft_train.jsonl</code> dataset. This dataset is engineered to teach any base model the precise 5-part institutional response structure:
            </p>

            <div className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
              <div className="text-emerald-400"># Example Python Fine-Tuning Pipeline with Google GenAI SDK</div>
              <div>from google import genai</div>
              <div>from google.genai import types</div>
              <div className="pt-1">client = genai.Client()</div>
              <div className="pt-1"># 1. Upload training dataset</div>
              <div>training_file = client.files.upload(file="institutional_kpi_agent_sft_train.jsonl")</div>
              <div className="pt-1"># 2. Launch fine-tuning job on gemini-3.8-flash</div>
              <div>operation = client.tunings.tune(</div>
              <div className="pl-4">base_model="models/gemini-3.8-flash",</div>
              <div className="pl-4">training_dataset=training_file.name,</div>
              <div className="pl-4">config=types.CreateTuningJobConfig(</div>
              <div className="pl-8">epoch_count=4,</div>
              <div className="pl-8">learning_rate_multiplier=1.0,</div>
              <div className="pl-8">batch_size=4,</div>
              <div className="pl-4">)</div>
              <div>)</div>
              <div className="text-slate-400 pt-1">print("Tuning job initiated:", operation.name)</div>
            </div>
          </div>

          {/* Section 2: Tabular ML (Scikit-Learn / XGBoost) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">
                2. Training XGBoost / Random Forest on Student Risk CSV
              </h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              The <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700 font-bold">student_academic_risk_ml_train.csv</code> features low-attendance, internal mark variances, and backlogs to predict academic failure and remedial requirements:
            </p>

            <div className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
              <div className="text-emerald-400"># Train Multi-Class Risk Classifier in Python</div>
              <div>import pandas as pd</div>
              <div>from sklearn.model_selection import train_test_split</div>
              <div>from sklearn.ensemble import RandomForestClassifier</div>
              <div>from sklearn.metrics import classification_report</div>
              <div className="pt-1">df = pd.read_csv("student_academic_risk_ml_train.csv")</div>
              <div>X = df[['attendance_pct', 'internal_marks_100', 'midterm_score_50', 'cumulative_backlogs', 'prior_semester_sgpa']]</div>
              <div>y = df['risk_level']</div>
              <div className="pt-1">X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)</div>
              <div>clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)</div>
              <div>clf.fit(X_train, y_train)</div>
              <div className="pt-1">y_pred = clf.predict(X_test)</div>
              <div>print(classification_report(y_test, y_pred))</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
