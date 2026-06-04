"use client";

import { useState } from "react";
import api from "../services/api";

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("Civil Engineer");
    const [companyName, setCompanyName] = useState("");
    const [error, setError] = useState("");
    const [profilePic, setProfilePic] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            if (isRegistering) {
                // Register the Account as a standard Field Operative
                const regData = new FormData();
                regData.append("username", username);
                regData.append("password", password);
                regData.append("is_admin", "false"); // We send it as a string
                if (fullName) regData.append("full_name", fullName);
                if (email) regData.append("email", email);
                if (role) regData.append("role", role);
                if (companyName) regData.append("company_name", companyName);
                if (profilePic) regData.append("profile_pic", profilePic);
                await api.post("/auth/register", regData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                alert("Account created succesfully, Please sign in");
                setIsRegistering(false);
            } else {
                // Log in and grab the JWT Token!
                const formData = new URLSearchParams();
                formData.append("username", username);
                formData.append("password", password);

                const res = await api.post("/auth/login", formData, {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                });

                // Save the JWT Keycard and Role permanently in the Browser
                localStorage.setItem("token", res.data.access_token);
                localStorage.setItem("isAdmin", res.data.is_admin ? "true" : "false");

                onLoginSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Invalid username or password.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
            {/* Background Blur FX */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md glass rounded-2xl border border-white/10 p-8 relative z-10 shadow-2xl">
                <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">InfraDSS</h1>
                <p className="text-zinc-400 text-sm mb-6 uppercase tracking-widest">{isRegistering ? "Create an account" : "Sign in to your account"}</p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {isRegistering && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <input type="text" required={isRegistering} value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500 transition-colors text-sm" placeholder="" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                                    <input type="email" required={isRegistering} value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500 transition-colors text-sm" placeholder="" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Organization</label>
                                    <input type="text" required={isRegistering} value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500 transition-colors text-sm" placeholder="" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Role</label>
                                    <select required={isRegistering} value={role} onChange={e => setRole(e.target.value)} className="w-full bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500 transition-colors text-sm">
                                        <option>Civil Engineer</option>
                                        <option>Structural Engineer</option>
                                        <option>Field Inspector</option>
                                        <option>Site Supervisor</option>
                                        <option>Project Manager</option>
                                        <option>Municipal Officer</option>
                                    </select>
                                </div>
                                <div className="mt-2 mb-4">
                                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Profile Picture (Optional)</label>
                                    <input type="file" accept="image/*" onChange={e => setProfilePic(e.target.files?.[0] || null)} className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-900/30 file:text-violet-400 hover:file:bg-violet-900/50 transition-colors" />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Username</label>
                        <input
                            type="text" required
                            value={username} onChange={e => setUsername(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                            placeholder=""
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password" required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                            placeholder=""
                        />
                    </div>

                    {error && <p className="text-rose-400 text-sm p-3 bg-rose-500/10 rounded border border-rose-500/20">{error}</p>}

                    <button type="submit" className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg transition-colors mt-4 shadow-lg shadow-white/5">
                        {isRegistering ? "Create Account" : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-xs text-zinc-500 hover:text-white uppercase tracking-wider font-medium transition-colors"
                    >
                        {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Create Account"}
                    </button>
                </div>
            </div>
        </div>
    );
}
