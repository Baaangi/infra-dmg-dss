"use client"; // Required for interactivity

import { useState } from "react";
import { uploadInspection, InspectionResponse } from "../services/api";

interface Props {
  onUploadSuccess: (data: InspectionResponse) => void;
}

export default function InspectionForm({ onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    structure_type: "Bridge",
    age_years: 0,
    environment: "Urban",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");

    setLoading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("structure_type", formData.structure_type);
    data.append("age_years", formData.age_years.toString());
    data.append("environment", formData.environment);

    try {
      const result = await uploadInspection(data);
      onUploadSuccess(result); // Pass result up to parent
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed! Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-4 max-w-md border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">New Inspection</h2>

      {/* File Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Infrastructure Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {/* Structure Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={formData.structure_type}
          onChange={(e) => setFormData({ ...formData, structure_type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        >
          <option>Bridge</option>
          <option>Road</option>
          <option>Building</option>
        </select>
      </div>

       {/* Age */}
       <div>
        <label className="block text-sm font-medium text-gray-700">Age (Years)</label>
        <input
          type="number"
          value={formData.age_years}
          onChange={(e) => setFormData({ ...formData, age_years: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        />
      </div>

      {/* Environment */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Environment</label>
        <select
          value={formData.environment}
          onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        >
          <option>Urban</option>
          <option>Coastal</option>
          <option>Rural</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
          ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>
    </form>
  );
}
