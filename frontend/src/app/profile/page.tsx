"use client";

const getAvatarUrl = (path: string) => `http://127.0.0.1:8000/${path}`;
import { useState, useEffect } from "react";
import api from "../../services/api";
import { UserCircleIcon, IdentificationIcon, BuildingOfficeIcon, AtSymbolIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

interface UserProfile {
    username: string;
    is_admin: boolean;
    full_name: string | null;
    email: string | null;
    role: string | null;
    company_name: string | null;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const [editData, setEditData] = useState({
        full_name: "",
        email: "",
        role: "",
        company_name: ""
    });

    // Fetch the identity token from the vault on load
    useEffect(() => {
        api.get("/auth/me")
            .then(res => {
                setProfile(res.data);
                setEditData({
                    full_name: res.data.full_name || "",
                    email: res.data.email || "",
                    role: res.data.role || "Civil Engineer",
                    company_name: res.data.company_name || ""
                });
            })
            .catch(err => console.error("Failed to authenticate identity", err));
    }, []);

    const handleSave = async () => {
        try {
            await api.put("/auth/me", editData);
            setProfile({ ...profile!, ...editData });
            setIsEditing(false);
            
            // Reload window fully to propogate any Name/Role changes directly into the Sidebar!
            window.location.reload(); 
        } catch (error) {
            console.error("Failed to sync profile", error);
            alert("Error syncing profile updates.");
        }
    };

    if (!profile) return <div className="p-8 text-zinc-500 font-mono tracking-widest uppercase">Loading...</div>;

    return (
        <main className="p-8 min-h-screen">
            {/* Header */}
            <div className="mb-10 border-b border-white/5 pb-6">
                <h1 className="text-2xl font-semibold text-white tracking-tight">Profile Settings</h1>
                <p className="text-zinc-500 text-sm mt-1">Manage your profile.</p>
            </div>

            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Panel: Read-Only ID Card */}
                <div className="col-span-1">
                    <div className="glass rounded-xl p-6 border border-white/5 relative overflow-hidden">
                        {/* Status Glow */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${profile.is_admin ? 'bg-violet-500' : 'bg-emerald-500'}`} />
                        
                        <div className="flex flex-col items-center text-center mt-4">
                            <label className="relative w-24 h-24 rounded-full flex items-center justify-center text-3xl font-light text-white mb-4 ring-4 ring-black shadow-2xl bg-zinc-800 cursor-pointer group overflow-hidden">
                                {profile.profile_pic_path ? (
                                <img src={getAvatarUrl(profile.profile_pic_path)} className="w-full h-full object-cover" />
                                ) : (
                                <span className="z-10">{profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : profile.username.substring(0, 2).toUpperCase()}</span>
                                )}
                                {/* Upload Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-white text-center">Change<br/>Photo</span>
                                </div>
                                {/* Invisible Input */}
                                <input 
                                    type="file" accept="image/*" className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const uploadData = new FormData();
                                        uploadData.append("profile_pic", file);
                                        try {
                                            await api.post("/auth/me/avatar", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
                                            window.location.reload(); 
                                        } catch { alert("Failed to swap avatar"); }
                                    }}
                                />
                            </label>
                            <h2 className="text-xl font-medium text-white">{profile.full_name || "Unknown User"}</h2>
                            <p className="text-sm text-zinc-400 mt-1">{profile.job_title || profile.role || "Unassigned"}</p>
                            
                            <div className="mt-4 px-3 py-1 rounded border border-white/10 bg-black text-xs font-mono text-zinc-500 mb-6">
                                ID: {profile.username}
                            </div>
                            
                            {profile.is_admin && (
                                <div className="flex items-center gap-2 text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-md border border-violet-500/20 w-full justify-center text-sm font-medium">
                                    <ShieldCheckIcon className="w-4 h-4" /> System Administrator
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Editable Matrix */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="glass rounded-xl p-8 border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-white">Profile Information</h3>
                            <button 
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                                    isEditing ? "bg-violet-600 text-white hover:bg-violet-500" : "bg-white/5 text-zinc-300 hover:bg-white/10"
                                }`}
                            >
                                {isEditing ? "Save Changes" : "Edit Details"}
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Form Field Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                        <IdentificationIcon className="w-4 h-4" /> Full Name
                                    </label>
                                    {isEditing ? (
                                        <input type="text" value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-white outline-none focus:border-violet-500 text-sm" />
                                    ) : (
                                        <p className="text-zinc-200 text-sm bg-black/40 px-3 py-2 rounded-md border border-transparent">{profile.full_name || "N/A"}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                        <AtSymbolIcon className="w-4 h-4" /> Email Address
                                    </label>
                                    {isEditing ? (
                                        <input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-white outline-none focus:border-violet-500 text-sm" />
                                    ) : (
                                        <p className="text-zinc-200 text-sm bg-black/40 px-3 py-2 rounded-md border border-transparent">{profile.email || "N/A"}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                        <UserCircleIcon className="w-4 h-4" /> Role
                                    </label>
                                    {isEditing ? (
                                        <select value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-white outline-none focus:border-violet-500 text-sm">
                                            <option>Civil Engineer</option>
                                            <option>Structural Engineer</option>
                                            <option>Field Inspector</option>
                                            <option>Site Supervisor</option>
                                            <option>Project Manager</option>
                                            <option>Municipal Officer</option>
                                        </select>
                                    ) : (
                                        <p className="text-zinc-200 text-sm bg-black/40 px-3 py-2 rounded-md border border-transparent">{profile.role || "N/A"}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                        <BuildingOfficeIcon className="w-4 h-4" /> Organization
                                    </label>
                                    {isEditing ? (
                                        <input type="text" value={editData.company_name} onChange={e => setEditData({...editData, company_name: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-white outline-none focus:border-violet-500 text-sm" />
                                    ) : (
                                        <p className="text-zinc-200 text-sm bg-black/40 px-3 py-2 rounded-md border border-transparent">{profile.company_name || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </main>
    );
}
