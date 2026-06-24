import Link from 'next/link';

export default function SmallFooter() {
    return (
        <footer className="w-full mt-auto py-5 flex justify-center px-4 sm:px-6 shrink-0 select-none">
            <div className="w-full max-w-6xl bg-white/70 backdrop-blur-md border border-[#eadcc5]/85 rounded-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(74,54,30,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side: Status Indicator & Title & Privacy Policy & Terms of Service */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                    <span className="text-[14px] font-semibold text-gray-700 tracking-widest uppercase">
                        FFCS Planner © {new Date().getFullYear()}
                    </span>
                    <span className="hidden sm:inline text-[#eadcc5]">|</span>
                    <Link 
                        href="/privacy" 
                        className="text-[13px] font-extrabold text-[#5674ea] hover:underline uppercase tracking-widest transition-all active:scale-95 duration-200"
                    >
                        Privacy Policy
                    </Link>
                    <span className="hidden sm:inline text-[#eadcc5]">|</span>
                    <Link 
                        href="/terms" 
                        className="text-[13px] font-extrabold text-[#5674ea] hover:underline uppercase tracking-widest transition-all active:scale-95 duration-200"
                    >
                        Terms of Service
                    </Link>
                </div>

                {/* Right side: Credits Link */}
                <div className="text-[13px] font-semibold text-gray-500 tracking-widest uppercase flex flex-wrap items-center justify-center gap-2">
                    <span>Designed & Built with</span>
                    <span className="text-red-500 text-sm">❤️</span>
                    <span>by</span>
                    <a 
                        href="https://microsoftinnovations.club" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center px-3.5 py-1.5 text-[#5674ea] rounded-xl font-extrabold transition-all shadow-sm active:scale-95 duration-200"
                    >
                        Microsoft Innovations Club
                    </a>
                </div>
            </div>
        </footer>
    );
}
