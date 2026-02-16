"use client";

import { useState } from "react";
import InspectionForm from "../components/InspectionForm";
import DamageMap from "../components/DamageMap";
import InspectionList from "../components/InspectionList"; // <--- Import
import { InspectionResponse } from "../services/api";

export default function Home() {
  const [result, setResult] = useState<InspectionResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to refresh list after upload

  const handleUploadSuccess = (data: InspectionResponse) => {
    setResult(data);
    setRefreshKey(prev => prev + 1); // Trigger list refresh
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Upload & History (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-6">
              🛡️ AI Damage Assesment
            </h1>
            <InspectionForm onUploadSuccess={handleUploadSuccess} />
          </div>
          
          <InspectionList 
            onSelect={setResult} 
            refreshTrigger={refreshKey} 
          />
        </div>

        {/* Right Area: Visualization (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Inspection Details</h2>
            
            {result ? (
              <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase">Risk Score</div>
                    <div className={`text-2xl font-bold ${
                        result.risk_score > 50 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.risk_score.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase">Priority</div>
                     <span className="font-semibold text-gray-800">
                      {result.maintenance_priority}
                    </span>
                  </div>
                   <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase">Defects</div>
                     <span className="font-semibold text-gray-800">
                      {result.defects.length} detected
                    </span>
                  </div>
                </div>

                {/* Visualization */}
                <div className="flex justify-center bg-gray-900 rounded-lg p-2 min-h-[400px] items-center">
                   <DamageMap data={result} />
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-lg">Select an inspection from the list</p>
                  <p className="text-sm">or upload a new image</p>
               </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
