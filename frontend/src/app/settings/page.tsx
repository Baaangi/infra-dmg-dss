"use client";

import { useEffect, useState } from "react";
import { AdjustmentsHorizontalIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    confidence_threshold: 0.02
  });
  const [saving, setSaving] = useState(false);

  // Fetch current memory
  useEffect(() => {
    fetch("http://127.0.0.1:8000/settings/")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("http://127.0.0.1:8000/settings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setTimeout(() => setSaving(false), 500); // UI feedback
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <main className="p-8 relative min-h-screen">
      <div className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight">System Preferences</h1>
        <p className="text-zinc-500 text-sm mt-1">Configure your Decision Support Environment.</p>
      </div>

      <div className="max-w-3xl glass rounded-lg border border-white/5 p-8 flex flex-col gap-8">
        
        {/* Core Setting: AI Strictness */}
        <div className="pb-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="text-white font-medium text-lg">AI Confidence Meter</h3>
              <p className="text-zinc-500 text-sm mt-1 mb-4">Determines the minimum certainty required (1% - 100%) for the AI to flag an anomaly. Lower values catch more defects but increase false positives.</p>
            </div>
            <span className="text-3xl font-light text-violet-400">{(settings.confidence_threshold * 100).toFixed(0)}%</span>
          </div>
          <input 
            type="range" min="0.01" max="1.0" step="0.01" value={settings.confidence_threshold}
            onChange={(e) => setSettings({...settings, confidence_threshold: parseFloat(e.target.value)})}
            className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400 transition-all"
          />
        </div>

        {/* Action Bar */}
        <div className="pt-6 border-t border-white/5 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {saving ? <CheckCircleIcon className="w-5 h-5 text-green-600" /> : <AdjustmentsHorizontalIcon className="w-5 h-5" />}
            {saving ? "Preferences Saved!" : "Save Preferences"}
          </button>
        </div>

      </div>
    </main>
  );
}
