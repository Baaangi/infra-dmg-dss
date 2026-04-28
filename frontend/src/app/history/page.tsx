"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

// Temporary localized interface 
interface HistoryInspection {
  id: number;
  image_path: string;
  infra_type: string;
  environment: string;
  age_years: number;
  risk_score: number;
  maintenance_priority: string;
  timestamp: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryInspection[]>([]);

  useEffect(() => {
    // Import API dynamically to prevent SSR hydration mismatches
    import("../../services/api").then(({ getInspections }) => {
        getInspections()
            .then((data) => {
                if (Array.isArray(data)) setHistory(data);
                else console.error("API returned non-array:", data);
            })
            .catch((err) => console.error("Error fetching history", err));
    });
  }, []);

  // Compute Statistics locally
  const totalScans = history.length;
  const criticalScans = history.filter(h => h.maintenance_priority === "Critical").length;
  const averageRisk = totalScans > 0 ? (history.reduce((acc, h) => acc + h.risk_score, 0) / totalScans).toFixed(1) : 0;

  // Chart Data: Priority
  const priorityData = [
    { name: 'Critical', value: criticalScans, color: '#e11d48' },
    { name: 'High', value: history.filter(h => h.maintenance_priority === "High").length, color: '#f97316' },
    { name: 'Medium', value: history.filter(h => h.maintenance_priority === "Medium").length, color: '#3b82f6' },
  ];

  // Chart Data: Environment
  const envCounts = history.reduce((acc: any, h) => {
    acc[h.environment] = (acc[h.environment] || 0) + 1;
    return acc;
  }, {});
  const envData = Object.keys(envCounts).map(key => ({ name: key, count: envCounts[key] }));

  return (
    <main className="p-8 relative min-h-screen">
      {/* Header */}
      <div className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Inspection History</h1>
        <p className="text-zinc-500 text-sm mt-1">Global audit database and categorical metrics.</p>
      </div>

      {/* Global Metrics Row (Top Section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass rounded-lg p-6 border-l-4 border-l-violet-500 flex flex-col justify-center">
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-2">Total Audits</p>
            <p className="text-5xl font-light text-white tracking-tighter">{totalScans}</p>
        </div>
        <div className="glass rounded-lg p-6 border-l-4 border-l-orange-500 flex flex-col justify-center">
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-2">Avg Risk Score</p>
            <p className="text-5xl font-light text-white tracking-tighter">{averageRisk}<span className="text-xl text-zinc-600 ml-1">/100</span></p>
        </div>
        <div className="glass rounded-lg p-6 border-l-4 border-l-rose-500 flex flex-col justify-center">
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-2">Critical Assets</p>
            <p className="text-5xl font-light text-white tracking-tighter">{criticalScans}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="glass rounded-lg p-6 h-72 flex flex-col">
          <h3 className="text-sm font-medium text-zinc-300 mb-4 uppercase tracking-wider">Severity Breakdown</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-lg p-6 h-72 flex flex-col">
          <h3 className="text-sm font-medium text-zinc-300 mb-4 uppercase tracking-wider">Environmental Spread</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={envData}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)'}} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Standalone Assessment Cards Grid */}
      <h3 className="text-lg font-semibold text-white mb-6 border-b border-white/5 pb-2">Archived Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {history.map((inspection) => {
           const filename = inspection.image_path.split(/[/\\]/).pop(); 
           const imageUrl = `http://127.0.0.1:8000/uploads/${filename}`;
           
           return (
            <div key={inspection.id} className="glass rounded-lg overflow-hidden group border border-white/5 hover:border-white/20 transition-all">
                {/* Image Header */}
                <div className="relative h-48 bg-zinc-900 border-b border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Asset" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Floating Priority Badge */}
                    <div className={`absolute top-4 right-4 px-2.5 py-1 rounded text-xs font-semibold shadow-lg backdrop-blur-md border uppercase tracking-widest ${
                        inspection.maintenance_priority === "Critical" ? "bg-rose-500/80 text-white border-rose-400" :
                        inspection.maintenance_priority === "High" ? "bg-orange-500/80 text-white border-orange-400" :
                        "bg-blue-500/80 text-white border-blue-400"
                    }`}>
                        {inspection.maintenance_priority}
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">Report #{inspection.id}</p>
                            <h4 className="text-zinc-200 font-medium text-sm mt-1">{inspection.infra_type} | {inspection.environment}</h4>
                        </div>
                        <div className="bg-black/50 px-3 py-1.5 rounded-md border border-white/5 flex items-center justify-center">
                            <span className="text-lg font-semibold text-white">{inspection.risk_score.toFixed(0)}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.open(`http://127.0.0.1:8000/inspections/${inspection.id}/report`, '_blank')}
                        className="w-full mt-2 py-2.5 flex items-center justify-center gap-2 bg-white/5 hover:bg-violet-600 border border-white/10 hover:border-violet-500 rounded text-sm text-zinc-300 hover:text-white transition-colors"
                    >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        Download PDF Report
                    </button>
                </div>
            </div>
           )
        })}
      </div>
    </main>
  );
}
