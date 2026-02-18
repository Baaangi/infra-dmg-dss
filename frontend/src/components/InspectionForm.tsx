"use client";

import { useState } from "react";
import { uploadInspection, InspectionResponse } from "../services/api";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

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
      onUploadSuccess(result);
    } catch (error) {
      alert("Error uploading");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-lg">
      <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
        <CloudArrowUpIcon className="w-4 h-4 text-violet-400" />
        New Analysis
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Modern File Input */}
        <div className="border border-dashed border-zinc-700/50 rounded-lg p-8 text-center hover:bg-zinc-800/30 hover:border-violet-500/30 transition-all cursor-pointer group relative bg-zinc-900/20">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors pointer-events-none text-sm">
            {file ? (
              <span className="font-medium text-violet-400 break-all">{file.name}</span>
            ) : (
              <span>Drop image or <span className="text-violet-400 hover:underline">browse</span></span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Type</label>
            <select
              value={formData.structure_type}
              onChange={(e) => setFormData({ ...formData, structure_type: e.target.value })}
              className="w-full rounded-md border border-zinc-700/50 bg-zinc-900/50 text-zinc-200 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 p-2 outline-none transition-all placeholder-zinc-600"
            >
              <option className="bg-zinc-900 text-white">Bridge</option>
              <option className="bg-zinc-900 text-white">Road</option>
              <option className="bg-zinc-900 text-white">Building</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Environment</label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              className="w-full rounded-md border border-zinc-700/50 bg-zinc-900/50 text-zinc-200 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 p-2 outline-none transition-all"
            >
              <option className="bg-zinc-900 text-white">Urban</option>
              <option className="bg-zinc-900 text-white">Coastal</option>
              <option className="bg-zinc-900 text-white">Rural</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Age (Years)</label>
          <input
            type="number"
            value={formData.age_years || ""}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFormData({ ...formData, age_years: isNaN(val) ? 0 : val });
            }}
            className="w-full rounded-md border border-zinc-700/50 bg-zinc-900/50 text-zinc-200 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 p-2 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-md text-sm font-medium text-white shadow-sm transition-all
            ${loading ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-violet-600 hover:bg-violet-500 active:scale-[0.98]'}`}
        >
          {loading ? "Processing..." : "Run Analysis"}
        </button>
      </form>
    </div>
  );
}
