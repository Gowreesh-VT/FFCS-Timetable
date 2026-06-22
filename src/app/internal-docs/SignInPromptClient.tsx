'use client';

import React from 'react';
import { signIn } from 'next-auth/react';

export function SignInPromptClient() {
    return (
        <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4 relative overflow-hidden font-sans text-[#171717]">
            {/* Visual background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-[#A0C4FF]/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#CAFFD0]/10 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-white border border-[#f3ebdb] rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(74,54,30,0.06)] relative z-10 text-center animate-fade-in">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-black tracking-widest text-[#3B5BDB] uppercase">INTERNAL ENGINEER CORNER</span>
                        <h1 className="text-3xl font-black text-black leading-tight">Easter Egg Found! 🐣</h1>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                            This is the internal project documentation and engineering dashboard. Please sign in with your account to access.
                        </p>
                    </div>

                    <div className="w-full h-px bg-slate-100" />

                    <button
                        onClick={() => signIn('google')}
                        className="w-full py-3.5 bg-[#A0C4FF] hover:bg-[#8ab2f2] text-black font-black rounded-2xl shadow-[0_8px_30px_rgba(160,196,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm border-none"
                    >
                        Sign In with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
