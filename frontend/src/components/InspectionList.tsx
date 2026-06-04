"use client";

import { useEffect, useState } from "react";
import { getInspections, InspectionResponse } from "../services/api";

interface Props {
  onSelect: (inspection: InspectionResponse) => void;
  refreshTrigger: number;
}

export default function InspectionList({ onSelect, refreshTrigger }: Props) {
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      const data = await getInspections();
      setInspections(data);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-lg border border-white/5 h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <h3 className="font-medium text-zinc-300 text-xs uppercase tracking-wide">Recent Uploads</h3>
        <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded border border-white/5">
          {inspections.length} Total
        </span>
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500 animate-pulse">Loading history...</div>
        ) : inspections.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 italic">
            No inspections found.
          </div>
        ) : inspections.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="group flex flex-col p-3 rounded-md hover:bg-white/[0.03] border border-transparent hover:border-white/5 cursor-pointer transition-all duration-150"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-zinc-300 group-hover:text-white transition-colors text-sm">
                #{item.id} • {item.structure_type}
              </span>
              <span className="text-[10px] text-zinc-600 font-mono">
                {new Date(item.timestamp || Date.now()).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{item.environment}</span>
              <Badge score={item.risk_score} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper Badge Component
function Badge({ score }: { score: number }) {
  const isHigh = score > 50;
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${isHigh
        ? 'bg-rose-950/30 text-rose-400 border-rose-900/30'
        : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30'
      }`}>
      Risk: {score.toFixed(0)}
    </span>
  );
}
