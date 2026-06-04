"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBarIcon, ClockIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    // Read the user's role smoothly after the server hands the HTML to the browser
    useEffect(() => {
        setIsAdmin(localStorage.getItem("isAdmin") === "true");
        
        // Fetch Live Profile Matrix
        import("../services/api").then(({ default: api }) => {
            api.get("/auth/me").then(res => setProfile(res.data)).catch(() => {});
        });
    }, []);

    // A destructive action that shreds the JWT Keycard and forces a refresh!
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("isAdmin");
        window.location.reload(); 
    };

    return (
        <div className="w-64 border-r border-white/5 bg-[#09090b] text-zinc-400 h-screen flex flex-col fixed left-0 top-0 z-20 shadow-2xl">
            <div className="p-6">
                <Link href="/">
                    <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2 hover:text-violet-400 transition-colors cursor-pointer">
                        <div className="w-2 h-6 bg-violet-600 rounded-sm shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>
                        InfraDSS
                    </h1>
                </Link>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mt-2 pl-3">Infrastructure Damage Assesment System</p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-2">
                <NavButton href="/" icon={<ChartBarIcon className="w-5 h-5" />} text="Dashboard" active={pathname === "/"} />
                <NavButton href="/history" icon={<ClockIcon className="w-5 h-5" />} text="Inspection History" active={pathname === "/history"} />
                <NavButton href="/profile" icon={<UserCircleIcon className="w-5 h-5" />} text="Profile" active={pathname === "/profile"} />

                {/* ROLE-BASED RENDERING: Only mount this button in the DOM if isAdmin is true! */}
                {isAdmin && (
                    <NavButton href="/settings" icon={<Cog6ToothIcon className="w-5 h-5" />} text="Settings" active={pathname === "/settings"} />
                )}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center justify-between px-2">
                    
                    {/* Dynamic Profile Badge */}
                    <div className="flex items-center gap-3">
                        <Link href="/profile" className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ring-1 ring-white/10 hover:ring-violet-500 transition-colors ${isAdmin ? 'bg-violet-900' : 'bg-zinc-800'} overflow-hidden`}>
                            {profile?.profile_pic_path ? (
                                <img src={`http://127.0.0.1:8000/${profile.profile_pic_path}`} className="w-full h-full object-cover" />
                            ) : (
                                profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : (profile?.username ? profile.username.substring(0, 2).toUpperCase() : (isAdmin ? 'AD' : 'AG'))
                            )}
                        </Link>

                        <div className="flex flex-col overflow-hidden w-28">
                            <Link href="/profile" className="text-xs font-medium text-zinc-200 hover:text-white transition-colors truncate">
                                {profile?.full_name || profile?.username || (isAdmin ? 'System Admin' : 'Active Account')}
                            </Link>
                            <p className={`text-[10px] truncate ${isAdmin ? 'text-violet-400' : 'text-zinc-500'}`}>
                                {profile?.role || (isAdmin ? 'Admin' : 'Field Operative')}
                            </p>
                        </div>
                    </div>
                    
                    {/* LOGOUT BUTTON */}
                    <button 
                        onClick={logout} 
                        className="p-2 hover:bg-rose-900/40 rounded-lg hover:text-rose-400 transition-colors flex-shrink-0" 
                        title="Sign Out"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    </button>

                </div>
            </div>
        </div>
    );
}

function NavButton({ href, icon, text, active }: any) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-300 ${
            active ? 'bg-violet-900/20 text-violet-400 border border-violet-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'hover:bg-zinc-900 hover:text-zinc-200'
        }`}>
            {icon} <span className="font-medium">{text}</span>
        </Link>
    )
}
