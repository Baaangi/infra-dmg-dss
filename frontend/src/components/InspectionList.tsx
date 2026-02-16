"use client";

import { useEffect, useState } from "react";
import { getInspections, InspectionResponse } from "../services/api";

interface Props {
  onSelect: (inspection: InspectionResponse) => void;
  refreshTrigger: number; // Simple way to trigger reload
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

  if (loading) return <div className="text-gray-500 text-sm">Loading history...</div>;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Recent Inspections</h3>
      </div>
      <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {inspections.map((item) => (
          <li 
            key={item.id} 
            onClick={() => onSelect(item)}
            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                #{item.id} - {item.structure_type}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(item.timestamp || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold
                ${item.risk_score > 50 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
              `}>
                Risk: {item.risk_score.toFixed(1)}
              </span>
            </div>
          </li>
        ))}
        {inspections.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-gray-400">
            No inspections found.
          </li>
        )}
      </ul>
    </div>
  );
}
