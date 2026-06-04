"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import { ShieldCheckIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState<"telemetry" | "personnel" | "ai">("personnel");

  // States
  const [users, setUsers] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [thresholdRoad, setThresholdRoad] = useState(0.5);
  const [thresholdBridge, setThresholdBridge] = useState(0.5);
  const [thresholdBuilding, setThresholdBuilding] = useState(0.5);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userInspections, setUserInspections] = useState<any[]>([]);

  // Fetches and filters the global inspections database for the specific user
  const handleViewUserScans = async (user: any) => {
    setSelectedUser(user);
    try {
      const res = await api.get('/inspections/?limit=100');
      // Filter the global pipeline for this user's specific uploads
      const scans = res.data.filter((scan: any) => scan.user_id === user.id);
      setUserInspections(scans);
    } catch (e) {
      console.error("Failed to load user scans", e);
    }
  };


  useEffect(() => {
    // Fetch AI Config
    api.get('/settings/').then(res => {
      setThresholdRoad(res.data.confidence_threshold_road ?? 0.25);
      setThresholdBridge(res.data.confidence_threshold_bridge ?? 0.35);
      setThresholdBuilding(res.data.confidence_threshold_building ?? 0.35);
    }).catch(() => { });
    // Fetch Personnel
    api.get('/auth/users').then(res => setUsers(res.data)).catch(() => { });
    // Fetch Telemetry
    api.get('/inspections/telemetry/system').then(res => setTelemetry(res.data)).catch(() => { });
  }, []);

  const handleAiUpdate = async () => {
  await api.put('/settings/', {
    confidence_threshold_road: thresholdRoad,
    confidence_threshold_bridge: thresholdBridge,
    confidence_threshold_building: thresholdBuilding
  });
  alert("System settings updated.");
};

  const handleClearanceToggle = async (userId: number, currentAdminStatus: boolean, username: string) => {
    const actionText = currentAdminStatus ? "REVOKE System Admin clearance from" : "GRANT System Admin clearance to";
    if (!confirm(`Are you sure you want to ${actionText} user ${username}?`)) return;

    try {
      await api.put(`/auth/users/${userId}/clearance`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !u.is_admin } : u));
    } catch { alert("Failed to modify clearance"); }
  };

  const handleTerminate = async (userId: number, username: string) => {
    if (!confirm(`WARNING: This will permanently delete the user and all associated data. Continue?`)) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setTelemetry({ ...telemetry, total_users: telemetry.total_users - 1 });
    } catch (e: any) { alert(e.response?.data?.detail || "Termination failed"); }
  };

  return (
    <main className="p-8 min-h-screen">
      <div className="mb-10 border-b border-white/5 pb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
          <ShieldCheckIcon className="w-8 h-8 text-violet-500" />
          Admin Dashboard
        </h1>
        <p className="text-zinc-500 text-sm mt-1"> </p>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-8 border-b border-white/5 pb-2">
        <TabButton active={activeTab === "personnel"} onClick={() => setActiveTab("personnel")}>User Management</TabButton>
        <TabButton active={activeTab === "telemetry"} onClick={() => setActiveTab("telemetry")}>System Statistics</TabButton>
        <TabButton active={activeTab === "ai"} onClick={() => setActiveTab("ai")}>Model Settings</TabButton>
      </div>

      {/* TAB CONTENT: PERSONNEL ROSTER */}
      {activeTab === "personnel" && (
        <div className="glass rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Total Audits</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    {/* Micro Avatar */}
                    <div className="w-8 h-8 rounded-full bg-zinc-800 ring-1 ring-white/10 overflow-hidden flex items-center justify-center text-[10px] text-white">
                      {user.profile_pic_path ? (<img src={`http://127.0.0.1:8000/${user.profile_pic_path}`} className="w-full h-full object-cover" />) : (user.username.substring(0, 2).toUpperCase())}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.full_name || user.username}</p>
                      <p className="text-zinc-500 text-xs">{user.email || user.role || "No Affiliation"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${user.is_admin ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
                      {user.is_admin ? "Admin" : "Standard"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="px-3 py-1 bg-black/50 border border-white/10 rounded-md inline-block text-zinc-300 font-mono">
                      {user.total_scans} Images
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleViewUserScans(user)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-900/30 hover:bg-blue-600 hover:text-white border border-blue-500/30 rounded transition-colors"
                    >
                      View Scans
                    </button>
                    <button
                      onClick={() => handleClearanceToggle(user.id, user.is_admin, user.username)}
                      className={`px-3 py-1.5 text-xs font-medium text-white rounded transition-colors ${user.is_admin
                          ? "bg-zinc-800 hover:bg-orange-600 border border-transparent"
                          : "bg-violet-900/40 hover:bg-violet-600 border border-violet-500/30"
                        }`}
                    >
                      {user.is_admin ? "Revoke Admin" : "Make Admin"}
                    </button>
                    <button onClick={() => handleTerminate(user.id, user.username)} className="px-2 py-1.5 bg-rose-900/30 hover:bg-rose-600 text-rose-500 hover:text-white rounded transition-colors" title="Delete Account">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: TELEMETRY */}
      {activeTab === "telemetry" && telemetry && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-8 border border-l-4 border-l-violet-500">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-1">Total Active Users</p>
            <p className="text-6xl font-light text-white tracking-tighter">{telemetry.total_users}</p>
          </div>
          <div className="glass rounded-xl p-8 border border-l-4 border-l-orange-500">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-1">Globally Processed Inpections</p>
            <p className="text-6xl font-light text-white tracking-tighter">{telemetry.total_scans}</p>
          </div>
          <div className="glass rounded-xl p-8 border border-l-4 border-l-rose-500">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-1">Critical Structures</p>
            <p className="text-6xl font-light text-rose-500 tracking-tighter">{telemetry.critical_scans}</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI CALIBRATION */}
      {activeTab === "ai" && (
        <div className="glass max-w-xl rounded-xl border border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none"></div>
          <h2 className="text-lg font-medium text-white mb-6">Model Calibration</h2>
          <div className="space-y-6">
            {/* Road Model Slider */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Road Model (Potholes) Threshold</label>
              <div className="flex items-center gap-6">
                <input
                  type="range" min="0.05" max="1" step="0.05"
                  value={thresholdRoad}
                  onChange={(e) => setThresholdRoad(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <span className="text-lg font-mono text-violet-400 bg-violet-500/10 px-3 py-1 rounded border border-violet-500/20 w-16 text-center">
                  {thresholdRoad.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bridge Model Slider */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Bridge Model (Cracks) Threshold</label>
              <div className="flex items-center gap-6">
                <input
                  type="range" min="0.05" max="1" step="0.05"
                  value={thresholdBridge}
                  onChange={(e) => setThresholdBridge(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <span className="text-lg font-mono text-violet-400 bg-violet-500/10 px-3 py-1 rounded border border-violet-500/20 w-16 text-center">
                  {thresholdBridge.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Building Model Slider */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Building Model (Cracks) Threshold</label>
              <div className="flex items-center gap-6">
                <input
                  type="range" min="0.05" max="1" step="0.05"
                  value={thresholdBuilding}
                  onChange={(e) => setThresholdBuilding(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <span className="text-lg font-mono text-violet-400 bg-violet-500/10 px-3 py-1 rounded border border-violet-500/20 w-16 text-center">
                  {thresholdBuilding.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={handleAiUpdate}
              className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" /> Save Settings
            </button>
          </div>
        </div>
      )}

      {/* --- USER UPLOADS MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div>
                <h2 className="text-xl font-semibold text-white">Analysis Data: {selectedUser.full_name || selectedUser.username}</h2>
                <p className="text-xs text-zinc-400 mt-1">{userInspections.length} total inspections uploaded.</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 font-medium text-white rounded transition-colors"
              >
                Close Window
              </button>
            </div>
            
            {/* Scrollable Gallery Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {userInspections.length === 0 ? (
                <div className="text-center text-zinc-500 py-16 border border-dashed border-white/5 rounded-xl">
                  <p>No scans found for this user.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userInspections.map((scan, i) => (
                    <div key={i} className="bg-black/40 border border-white/5 rounded-lg overflow-hidden group">
                      
                      {/* Image Preview Banner */}
                      <div className="h-40 overflow-hidden relative border-b border-white/5">
                        <img 
                          src={`http://127.0.0.1:8000/${scan.image_path}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-sm
                            ${scan.maintenance_priority === 'Critical' ? 'bg-rose-600/90 text-white' : 
                              scan.maintenance_priority === 'High' ? 'bg-orange-500/90 text-white' : 
                              'bg-blue-600/90 text-white'}`}>
                          {scan.maintenance_priority}
                        </span>
                      </div>
                      
                      {/* Data Analytics Footer */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white font-medium text-sm">{scan.structure_type}</p>
                          <p className="text-violet-400 font-mono text-xs font-bold">Score: {scan.risk_score.toFixed(1)}</p>
                        </div>
                        <p className="text-xs text-zinc-400 mb-3 truncate" title={scan.executive_summary}>
                          {scan.executive_summary || "No executive summary available."}
                        </p>
                        <div className="pt-3 border-t border-white/5 text-[10px] flex justify-between text-zinc-500 uppercase tracking-wider font-semibold">
                          <span>{scan.defects?.length || 0} Defects</span>
                          <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TabButton({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${active ? "bg-violet-900/40 text-violet-300 border border-violet-500/30" : "text-zinc-500 hover:text-white hover:bg-white/5"
        }`}
    >
      {children}
    </button>
  )
}
