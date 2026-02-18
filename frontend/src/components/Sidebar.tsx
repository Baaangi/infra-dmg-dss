"use client";

import { HomeIcon, CloudArrowUpIcon, ListBulletIcon, ChartBarIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
    const handleNavClick = (e: React.MouseEvent, name: string) => {
        e.preventDefault();
        if (name === 'Dashboard') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert(`${name} module is under construction.`);
        }
    };

    return (
        <div className="w-64 border-r border-white/5 bg-[#09090b] text-zinc-400 h-screen flex flex-col fixed left-0 top-0 z-20">
            <div className="p-6">
                <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                    <div className="w-2 h-6 bg-violet-600 rounded-sm"></div>
                    Project S10
                </h1>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mt-2 pl-3">Infrastructure Damage Assesment Tool</p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                <NavButton active icon={<ChartBarIcon className="w-5 h-5" />} text="Dashboard" onClick={(e: any) => handleNavClick(e, 'Dashboard')} />
                <NavButton icon={<ClockIcon className="w-5 h-5" />} text="History" onClick={(e: any) => handleNavClick(e, 'History')} />
                <NavButton icon={<Cog6ToothIcon className="w-5 h-5" />} text="Settings" onClick={(e: any) => handleNavClick(e, 'Settings')} />
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-white ring-1 ring-white/10">
                        JD
                    </div>
                    <div>
                        <p className="text-xs font-medium text-zinc-200">John Doe</p>
                        <p className="text-[10px] text-zinc-500">Lead Engineer</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NavButton({ icon, text, active = false, onClick }: any) {
    return (
        <a
            href="#"
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${active
                    ? 'bg-zinc-800/50 text-white border border-white/5'
                    : 'hover:bg-zinc-900 hover:text-zinc-200'
                }`}
        >
            {icon} <span className="font-medium">{text}</span>
        </a>
    )
}
