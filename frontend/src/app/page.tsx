"use client";

import { useState } from "react";
import InspectionForm from "../components/InspectionForm";
import DamageMap from "../components/DamageMap";
import InspectionList from "../components/InspectionList";

import { InspectionResponse } from "../services/api";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [result, setResult] = useState<InspectionResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = (data: InspectionResponse) => {
    setResult(data);
    setRefreshKey(prev => prev + 1);
  };

  const handleDownloadReport = async () => {
    if (!result) return alert("Please select an inspection first.");
    window.open(`http://127.0.0.1:8000/inspections/${result.id}/report`, '_blank');
  };

  return (
    <div>


      {/* 2. Main Content Wrapper */}
      <main className="p-8 relative">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-zinc-500 text-sm mt-1">Monitor infrastructure Integrity and Health.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => alert("Documentation coming soon.")}
              className="px-4 py-2 text-zinc-400 text-sm font-medium hover:text-white transition-colors"
            >
              Documentation
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-zinc-200 transition-all shadow-sm"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-8 min-h-[calc(100vh-200px)]">

          {/* Left Column: History & Upload (4 cols) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
            <InspectionForm onUploadSuccess={handleUploadSuccess} />
            <div className="flex-1 min-h-[300px]">
              <InspectionList onSelect={setResult} refreshTrigger={refreshKey} />
            </div>
          </div>

          {/* Right Column: Visualization (8 cols) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-[calc(100vh-140px)] sticky top-4">

            {/* Results Card */}
            <div className="glass rounded-lg p-6 flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-3">
                  Inspection Details {result && <span className="text-zinc-500 font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">#{result.id}</span>}
                </h2>
                {result && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${result.maintenance_priority === "Critical" ? "bg-rose-950/30 text-rose-400 border-rose-900/30" :
                      result.maintenance_priority === "High" ? "bg-orange-950/30 text-orange-400 border-orange-900/30" :
                        "bg-blue-950/30 text-blue-400 border-blue-900/30"
                    }`}>
                    {result.maintenance_priority} Priority
                  </span>
                )}
              </div>

              {result ? (
                <div className="flex-1 flex flex-col gap-6">
                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <MetricCard label="Risk Score" value={result.risk_score.toFixed(1)} />
                    <MetricCard label="Defects Detected" value={result.defects.length.toString()} />
                    <MetricCard label="Time" value={new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                  </div>

                  {/* Image Map */}
                  <div className="flex-1 min-h-0 bg-black/40 rounded border border-white/5 flex items-center justify-center p-4 relative overflow-hidden group">
                    <DamageMap data={result} />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/90 text-zinc-300 text-[10px] px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                      Interactive View
                    </div>
                  </div>

                  {/* AI Context Assessment (Natural inline flow) */}
                  {result.defects.length > 0 && (
                    <div className="shrink-0 bg-black/40 border border-white/5 rounded-lg p-5 shadow-inner mt-2">
                      <h3 className="text-xs font-semibold text-violet-400 mb-4 tracking-widest uppercase border-b border-white/5 pb-2">
                        AI Context Assessment Report
                      </h3>

                      {/* Executive Summary Block */}
                      {(result as any).executive_summary && (
                        <div className="mb-6 p-4 rounded-lg bg-violet-900/10 border border-violet-500/20 shadow-sm">
                           <p className="text-sm text-zinc-300 leading-relaxed mb-3">
                             <strong className="text-violet-400 block mb-1 uppercase tracking-wider text-[10px]">Overview</strong>
                             {(result as any).executive_summary}
                           </p>
                           <div className="p-3 bg-zinc-950/50 rounded-md border-l-2 border-amber-500">
                             <p className="text-sm text-amber-200/90 font-medium">
                               <strong className="text-amber-500 mr-2 uppercase tracking-wider text-[10px]">Master Directive:</strong> 
                               {(result as any).overall_recommendation}
                             </p>
                           </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {result.defects.map((defect, index) => {
                          const scale = (defect as any).damage_scale || "Unknown Scale";
                          const repair = (defect as any).repair_action || "No action recommended.";
                          return (
                            <div key={`report-${index}`} className="p-3 bg-zinc-900/40 rounded border-l-2 border-violet-500 shadow-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-white text-sm">{defect.defect_type}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider
                                  ${defect.severity === 'Critical' ? 'bg-red-950/30 text-rose-400' : 
                                    defect.severity === 'High' ? 'bg-orange-950/30 text-orange-400' : 
                                    'bg-blue-950/30 text-blue-400'}`}>
                                  {defect.severity}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1 mt-2">
                                <p className="text-xs text-zinc-300">
                                  <strong className="text-zinc-500 font-normal mr-1">Scale:</strong> {scale}
                                </p>
                                <p className="text-xs text-amber-200/90">
                                  <strong className="text-zinc-500 font-normal mr-1">Action:</strong> {repair}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20 text-zinc-600">
                  <p className="font-medium text-sm">No Inspection Selected</p>
                  <p className="text-xs mt-1 opacity-60">Select from history to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-zinc-900/40 p-4 rounded border border-white/5">
      <p className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white tracking-tight">{value}</p>
    </div>
  )
}
