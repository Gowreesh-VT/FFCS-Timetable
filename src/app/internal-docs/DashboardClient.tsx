'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';

type RouteMeta = {
    path: string;
    filePath: string;
    methods: string[];
    purpose: string;
    auth: string;
};

type ModelMeta = {
    name: string;
    filePath: string;
    fields: { name: string; definition: string }[];
};

type EnvMeta = {
    name: string;
    purpose: string;
    files: string[];
};

type DocsData = {
    generatedAt: string;
    routes: RouteMeta[];
    models: ModelMeta[];
    envs: EnvMeta[];
};

export function DashboardClient({ data, user }: { data: DocsData; user?: any }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'arch' | 'apis' | 'db' | 'env' | 'thirdparty'>('overview');
    const [apiSearch, setApiSearch] = useState('');

    // Filters
    const filteredRoutes = data.routes.filter(r => 
        r.path.toLowerCase().includes(apiSearch.toLowerCase()) || 
        r.purpose.toLowerCase().includes(apiSearch.toLowerCase()) ||
        r.methods.some(m => m.toLowerCase().includes(apiSearch.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#FFF8E7] text-[#171717] flex flex-col font-sans selection:bg-[#bdd7ff]">
            {/* Header banner */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#f3ebdb] px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center font-black text-white text-sm shadow-md">
                        FF
                    </div>
                    <div>
                        <h1 className="text-md font-black tracking-tight text-[#171717] flex items-center gap-2">
                            Project Docs <span className="text-[10px] font-bold text-[#3B5BDB] bg-[#bdd7ff]/40 px-2 py-0.5 rounded-full border border-[#bdd7ff]">ENGINEER CONSOLE</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-medium">Scanned: {new Date(data.generatedAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-[11px] font-black text-[#171717]">{user.name || 'Developer'}</span>
                            <span className="text-[9px] font-bold text-slate-400">{user.email}</span>
                        </div>
                    )}
                    <button
                        onClick={() => signOut({ callbackUrl: '/internal-docs' })}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-black rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main content grid */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">
                {/* Navigation tabs */}
                <nav className="flex flex-wrap gap-2 p-1.5 bg-white border border-[#f3ebdb] rounded-2xl w-fit shadow-sm">
                    {[
                        { id: 'overview', label: '📖 Overview & Stack' },
                        { id: 'arch', label: '🧬 Architecture Flow' },
                        { id: 'apis', label: '🔌 API Routes' },
                        { id: 'db', label: '💾 Databases & Schemas' },
                        { id: 'env', label: '🔑 Env Variables' },
                        { id: 'thirdparty', label: '☁️ Integrations' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-[#bdd7ff] text-[#1e40af] shadow-sm'
                                    : 'text-slate-600 hover:text-black hover:bg-slate-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Dashboard Tab Content */}
                <main className="flex-1 bg-white border border-[#f3ebdb] rounded-[32px] p-6 md:p-8 shadow-[0_16px_40px_rgba(74,54,30,0.03)] min-h-[500px]">
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-2xl font-black text-black">Project Overview</h2>
                                <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
                                    Welcome to the internal engineering docs for **FFCS-Timetable Planner**. This page serves as a live onboarding deck containing automatically parsed schemas, variables, routes, and comments directly from the current codebase branches.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                <div className="p-5 rounded-2xl border border-[#f3ebdb] bg-[#FFF8E7]/40 flex flex-col gap-3">
                                    <span className="text-lg">🛠️</span>
                                    <h3 className="text-sm font-black text-black">Core Technology Stack</h3>
                                    <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4">
                                        <li>Next.js 16.1 (App Router, Turbopack ready)</li>
                                        <li>React 19.2 & TypeScript</li>
                                        <li>Tailwind CSS v4 (native build system)</li>
                                        <li>Mongoose / MongoDB database engine</li>
                                        <li>NextAuth for identity resolution</li>
                                    </ul>
                                </div>
                                <div className="p-5 rounded-2xl border border-[#f3ebdb] bg-[#FFF8E7]/40 flex flex-col gap-3">
                                    <span className="text-lg">⚡</span>
                                    <h3 className="text-sm font-black text-black">Quickstart Startup</h3>
                                    <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4">
                                        <li>Install packages: <code className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[#3B5BDB] font-mono font-bold">npm install</code></li>
                                        <li>Run dev environment: <code className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[#3B5BDB] font-mono font-bold">npm run dev</code></li>
                                        <li>Seed course catalogs: <code className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[#3B5BDB] font-mono font-bold">npm run seed</code></li>
                                    </ul>
                                </div>
                                <div className="p-5 rounded-2xl border border-[#f3ebdb] bg-[#FFF8E7]/40 flex flex-col gap-3">
                                    <span className="text-lg">🔁</span>
                                    <h3 className="text-sm font-black text-black">Update & Regenerate Docs</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        If you add new routes, models, or TODOs, you can regenerate this page's content instantly by executing:
                                    </p>
                                    <code className="bg-slate-100 border border-slate-200 p-2 rounded-lg text-[#3B5BDB] font-mono font-bold text-center text-[10px]">
                                        npm run generate-docs
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ARCHITECTURE FLOW */}
                    {activeTab === 'arch' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black text-black">System Architecture & Flow</h2>
                                <p className="text-slate-600 text-sm">Visual mapping of request handlers, data systems, and external providers.</p>
                            </div>

                            <div className="w-full bg-[#FFF8E7]/40 border border-[#f3ebdb] rounded-3xl p-6 md:p-8 flex justify-center items-center overflow-x-auto min-h-[400px]">
                                {/* Interactive/Pure SVG Component Diagram */}
                                <svg width="800" height="400" viewBox="0 0 800 400" className="max-w-full text-slate-700">
                                    <defs>
                                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B5BDB" />
                                        </marker>
                                    </defs>

                                    {/* Client Box */}
                                    <rect x="50" y="160" width="140" height="80" rx="12" fill="white" stroke="#3B5BDB" strokeWidth="2" />
                                    <text x="120" y="200" textAnchor="middle" fill="#171717" fontSize="12" fontWeight="bold">Browser Client</text>
                                    <text x="120" y="218" textAnchor="middle" fill="#64748b" fontSize="10">Next.js Hydrated UI</text>

                                    {/* API/Server Router Box */}
                                    <rect x="320" y="140" width="160" height="120" rx="12" fill="white" stroke="#7c3aed" strokeWidth="2" />
                                    <text x="400" y="175" textAnchor="middle" fill="#171717" fontSize="12" fontWeight="bold">Next.js Server Core</text>
                                    <text x="400" y="195" textAnchor="middle" fill="#475569" fontSize="10">App Routes & Middleware</text>
                                    <text x="400" y="215" textAnchor="middle" fill="#94a3b8" fontSize="9">Edge/Node Runtime</text>

                                    {/* Database Box */}
                                    <rect x="610" y="50" width="140" height="80" rx="12" fill="white" stroke="#10b981" strokeWidth="2" />
                                    <text x="680" y="90" textAnchor="middle" fill="#171717" fontSize="12" fontWeight="bold">MongoDB / Mongoose</text>
                                    <text x="680" y="108" textAnchor="middle" fill="#047857" fontSize="10">User & Slot Data</text>

                                    {/* Redis Box */}
                                    <rect x="610" y="160" width="140" height="80" rx="12" fill="white" stroke="#ef4444" strokeWidth="2" />
                                    <text x="680" y="200" textAnchor="middle" fill="#171717" fontSize="12" fontWeight="bold">Upstash Redis</text>
                                    <text x="680" y="218" textAnchor="middle" fill="#b91c1c" fontSize="10">Rate Limit Windows</text>

                                    {/* Providers Box */}
                                    <rect x="610" y="270" width="140" height="80" rx="12" fill="white" stroke="#f59e0b" strokeWidth="2" />
                                    <text x="680" y="300" textAnchor="middle" fill="#171717" fontSize="11" fontWeight="bold">Integrations</text>
                                    <text x="680" y="318" textAnchor="middle" fill="#b45309" fontSize="9">Resend/PostHog/Sentry</text>

                                    {/* Connections */}
                                    <line x1="190" y1="200" x2="310" y2="200" stroke="#3B5BDB" strokeWidth="2" markerEnd="url(#arrow)" />
                                    <text x="250" y="190" textAnchor="middle" fill="#3B5BDB" fontSize="9">HTTP Request</text>

                                    {/* Server to DB */}
                                    <path d="M 480 180 L 530 180 L 530 90 L 600 90" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
                                    {/* Server to Redis */}
                                    <line x1="480" y1="200" x2="600" y2="200" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow)" />
                                    {/* Server to Integrations */}
                                    <path d="M 480 220 L 530 220 L 530 310 L 600 310" fill="none" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* API ROUTES */}
                    {activeTab === 'apis' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-2xl font-black text-black">API Reference Table</h2>
                                    <p className="text-slate-600 text-sm">List of backend API handlers parsed dynamically.</p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search endpoints, method, purpose..."
                                    value={apiSearch}
                                    onChange={(e) => setApiSearch(e.target.value)}
                                    className="px-4 py-2.5 bg-white border border-[#f3ebdb] rounded-xl text-xs text-black focus:outline-none focus:border-[#3B5BDB] w-full md:max-w-xs shadow-sm"
                                />
                            </div>

                            <div className="overflow-x-auto border border-[#f3ebdb] rounded-2xl bg-white">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#f3ebdb] bg-[#FFF8E7]/60 text-slate-700 uppercase font-black tracking-wider">
                                            <th className="px-4 py-3.5">Method</th>
                                            <th className="px-4 py-3.5">Path</th>
                                            <th className="px-4 py-3.5">Purpose / Action</th>
                                            <th className="px-4 py-3.5">Authorization</th>
                                            <th className="px-4 py-3.5">File Source</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f3ebdb]/60 text-slate-700">
                                        {filteredRoutes.map((route, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-all font-medium">
                                                <td className="px-4 py-4.5 flex gap-1 flex-wrap">
                                                    {route.methods.map((method) => {
                                                        const color = method === 'GET' ? 'bg-[#c8f7dc] text-[#065f46] border-[#a7f3d0]' :
                                                                      method === 'POST' ? 'bg-[#bdd7ff] text-[#1e40af] border-[#bfdbfe]' :
                                                                      'bg-[#ffd6e0] text-[#9d174d] border-[#fecdd3]';
                                                        return (
                                                            <span key={method} className={`px-2 py-0.5 rounded text-[10px] font-black border ${color}`}>
                                                                {method}
                                                            </span>
                                                        );
                                                    })}
                                                </td>
                                                <td className="px-4 py-4.5 font-mono text-[#3B5BDB] text-[13px] font-bold">{route.path}</td>
                                                <td className="px-4 py-4.5 text-slate-600 leading-relaxed max-w-xs">{route.purpose}</td>
                                                <td className="px-4 py-4.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${route.auth.includes('Required') ? 'bg-[#ffd6e0] text-[#9d174d] border border-[#fecdd3]' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                        {route.auth}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4.5 text-slate-400 font-mono text-[10px]">{route.filePath}</td>
                                            </tr>
                                        ))}
                                        {filteredRoutes.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-slate-400 font-bold">No API routes matched search query</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* DATABASES & SCHEMAS */}
                    {activeTab === 'db' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black text-black">Database Schemas</h2>
                                <p className="text-slate-600 text-sm">Mongoose collections definitions located inside <code className="bg-[#FFF8E7] px-1 py-0.5 rounded font-mono text-xs text-[#3B5BDB] font-bold">src/models/</code></p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                {data.models.map((model) => (
                                    <div key={model.name} className="border border-[#f3ebdb] rounded-3xl bg-white p-5 md:p-6 flex flex-col gap-4 shadow-sm">
                                        <div className="flex items-center justify-between border-b border-[#f3ebdb] pb-3">
                                            <h3 className="font-black text-[#171717] text-md flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                                                {model.name}
                                            </h3>
                                            <span className="text-[10px] text-slate-400 font-mono">{model.filePath}</span>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Document structure</span>
                                            <div className="bg-[#FFF8E7]/40 border border-[#f3ebdb] rounded-2xl p-4 font-mono text-[11px] text-[#065f46] overflow-x-auto max-h-64">
                                                {model.fields.map((field, i) => (
                                                    <div key={i} className="py-1 flex justify-between gap-4 border-b border-[#f3ebdb]/40 last:border-0">
                                                        <span className="text-[#171717] font-bold">{field.name}</span>
                                                        <span className="text-slate-500 text-right">{field.definition}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ENV VARIABLES */}
                    {activeTab === 'env' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black text-black">Environment Configurations</h2>
                                <p className="text-slate-600 text-sm">Overview of system credentials and config variables. Real secret values are never printed here.</p>
                            </div>

                            <div className="overflow-x-auto border border-[#f3ebdb] rounded-2xl bg-white">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#f3ebdb] bg-[#FFF8E7]/60 text-slate-700 uppercase font-black tracking-wider">
                                            <th className="px-4 py-3.5">Variable Name</th>
                                            <th className="px-4 py-3.5">Purpose / Config Description</th>
                                            <th className="px-4 py-3.5">Referenced in files</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f3ebdb]/60 text-slate-700 font-medium">
                                        {data.envs.map((env, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-all">
                                                <td className="px-4 py-4.5 font-mono text-black text-[13px] font-bold">{env.name}</td>
                                                <td className="px-4 py-4.5 leading-relaxed max-w-sm text-slate-600">{env.purpose}</td>
                                                <td className="px-4 py-4.5 font-mono text-[9px] text-slate-500 max-w-xs flex flex-wrap gap-1">
                                                    {env.files.map((file, idx) => (
                                                        <span key={idx} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                                            {file}
                                                        </span>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* THIRD PARTY INTEGRATIONS */}
                    {activeTab === 'thirdparty' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black text-black">Third-Party Platforms</h2>
                                <p className="text-slate-600 text-sm">Services relied upon by this application stack.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <div className="p-6 rounded-3xl border border-[#f3ebdb] bg-[#FFF8E7]/30 flex flex-col gap-3">
                                    <h3 className="font-bold text-black text-md">🔐 NextAuth / Google Login</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Configured via Google Cloud Developer Console. Provides secure user session handling. Keys configured using <code className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px] text-[#3B5BDB] font-bold">GOOGLE_CLIENT_ID</code> and <code className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px] text-[#3B5BDB] font-bold">GOOGLE_CLIENT_SECRET</code>.
                                    </p>
                                </div>
                                <div className="p-6 rounded-3xl border border-[#f3ebdb] bg-[#FFF8E7]/30 flex flex-col gap-3">
                                    <h3 className="font-bold text-black text-md">✉️ Resend Email Service</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Utilized to route user feedback submissions directly to administration boxes. Uses `resend` client library configured via <code className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px] text-[#3B5BDB] font-bold">RESEND_API_KEY</code> and <code className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px] text-[#3B5BDB] font-bold">CONTACT_EMAIL</code>.
                                    </p>
                                </div>
                                <div className="p-6 rounded-3xl border border-[#f3ebdb] bg-[#FFF8E7]/30 flex flex-col gap-3">
                                    <h3 className="font-bold text-black text-md">📊 PostHog Telemetry</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Integrates client-side analytics to record click actions, active routes, and performance funnels. Initialized in <code className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px] text-[#3B5BDB] font-bold">src/components/Providers.tsx</code>.
                                    </p>
                                </div>
                                <div className="p-6 rounded-3xl border border-[#f3ebdb] bg-[#FFF8E7]/30 flex flex-col gap-3">
                                    <h3 className="font-bold text-black text-md">🐛 Sentry Error Monitoring</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Captures edge, server, and client failures instantly. Managed via standard Next.js instrumentation file integrations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
