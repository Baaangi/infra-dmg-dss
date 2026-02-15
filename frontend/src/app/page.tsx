"use client";

import { useState } from "react";
import InspectionForm from "../components/InspectionForm";
import { InspectionResponse } from "../services/api";

export default function Home() {
  const [result, setResult] = useState<InspectionResponse | null>(null);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Upload Form */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
            🛡️ AI Damage Assessment
          </h1>
          <InspectionForm onUploadSuccess={setResult} />
        </div>

        {/* Right Column: Results */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Assessment Results</h2>
          
          {result ? (
            <div className="space-y-4">
              {/* Risk Badge */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">Risk Score</div>
                <div className={`text-2xl font-bold ${
                    result.risk_score > 50 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {result.risk_score}/100
                </div>
              </div>

               {/* Priority Badge */}
               <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Priority: {result.maintenance_priority}
              </div>

              {/* Raw Data (for debugging) */}
              <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-xs max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>

              {/* Image Preview (Direct from Backend) */}
              {/* Note: In production, you'd need to serve 'uploads' statically or use an S3 URL */}
               <div className="mt-4">
                  <p className="text-xs text-gray-400">Analysis performed on: {result.image_path}</p>
               </div>

            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p>Upload an image to see analysis results</p>
             </div>
          )}
        </div>

      </div>
    </main>
  );
}
