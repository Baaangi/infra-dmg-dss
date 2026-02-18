"use client";

import { useState } from "react";
import InspectionForm from "../components/InspectionForm";
import DamageMap from "../components/DamageMap";
import InspectionList from "../components/InspectionList";
import Sidebar from "../components/Sidebar";
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
    <div className="flex min-h-screen">

      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 ml-64 p-8 relative">

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
            <div className="glass rounded-lg p-6 flex-1 flex flex-col relative overflow-hidden">

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
                  <div className="flex-1 bg-black/40 rounded border border-white/5 flex items-center justify-center p-4 relative overflow-hidden group">
                    <DamageMap data={result} />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/90 text-zinc-300 text-[10px] px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                      Interactive View
                    </div>
                  </div>
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
