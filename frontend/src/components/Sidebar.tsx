"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBarIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
    const pathname = usePathname();

    const handleSettingsInfo = (e: React.MouseEvent) => {
        e.preventDefault();
        alert("Settings module coming next!");
    };

    return (
        <div className="w-64 border-r border-white/5 bg-[#09090b] text-zinc-400 h-screen flex flex-col fixed left-0 top-0 z-20 shadow-2xl">
            <div className="p-6">
                <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                    <div className="w-2 h-6 bg-violet-600 rounded-sm shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>
                    Project S10
                </h1>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mt-2 pl-3">Infrastructure DSS</p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-2">
                <NavButton href="/" icon={<ChartBarIcon className="w-5 h-5" />} text="Dashboard" active={pathname === "/"} />
                <NavButton href="/history" icon={<ClockIcon className="w-5 h-5" />} text="History" active={pathname === "/history"} />
                <NavButton href="/settings" icon={<Cog6ToothIcon className="w-5 h-5" />} text="Settings" active={pathname === "/settings"} />
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-white ring-1 ring-white/10">
                        JD
                    </div>
                    <div>
                        <p className="text-xs font-medium text-zinc-200">Mohammed N.</p>
                        <p className="text-[10px] text-zinc-500 hover:text-violet-400 cursor-pointer">Lead Engineer</p>
                    </div>
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
