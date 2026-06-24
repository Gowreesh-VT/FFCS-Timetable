"use client";
import React, { useState } from "react";
import Image from "next/image";
import LoginModal from "../../components/loginPopup";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { clearPlannerClientCache } from "@/lib/clientCache";
import { parseName } from "@/lib/utils";

type FloatingTile = {
  id: number;
  letter: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseAngle: number;
  angle: number;
  rotAmplitude: number;
  rotSpeed: number;
  rotPhase: number;
  depth: number;
  depthPhase: number;
  wobblePhase: number;
  vibrationPhase: number;
  jitterX: number;
  jitterY: number;
};

const FLOATING_TILE_SIZE = 44;

const FLOATING_TILE_LAYOUT = [
  { letter: "G", color: "#d1fae5", xPct: 0.48, yPct: 0.1, angle: 18, vx: -0.26, vy: 0.18 },
  { letter: "B", color: "#bfdbfe", xPct: 0.68, yPct: 0.26, angle: -34, vx: -0.2, vy: 0.2 },
  { letter: "E", color: "#a7f3d0", xPct: 0.84, yPct: 0.1, angle: -30, vx: -0.16, vy: 0.26 },
  { letter: "C", color: "#f3e8ff", xPct: 0.1, yPct: 0.44, angle: -22, vx: 0.24, vy: -0.12 },
  { letter: "D", color: "#fef3c7", xPct: 0.34, yPct: 0.58, angle: -8, vx: 0.16, vy: -0.2 },
  { letter: "F", color: "#e9d5ff", xPct: 0.62, yPct: 0.66, angle: 34, vx: 0.22, vy: -0.16 },
  { letter: "A", color: "#fef08a", xPct: 0.84, yPct: 0.62, angle: -8, vx: -0.2, vy: -0.24 }
];

type MemberCategory = 'all' | 'lead' | 'frontend' | 'fullstack' | 'design';

type TeamMember = {
  name: string;
  role: string;
  category: MemberCategory;
  tagline: string;
  gradient: string;
  photo?: string;
  github: string;
  linkedin: string;
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Gowreesh V T",
    role: "Lead Developer",
    category: "lead",
    tagline: "System Architect & Logic orchestrator of the planner.",
    gradient: "from-[#A0C4FF] to-[#3B5BDB]",
    photo: "https://h8z6stjynz.ufs.sh/f/nEev6VX4XfKEUtYJgRdHmv6NAQPqtFZLJxCe2437IdY1nlS9",
    github: "https://github.com/Gowreesh-VT",
    linkedin: "https://linkedin.com/in/gowreesh"
  },
  {
    name: "Gouse Moideen",
    role: "Lead Developer",
    category: "lead",
    tagline: "Database systems designer & API synchronizer.",
    gradient: "from-[#9EE7FF] to-[#0F85AC]",
    photo: "https://h8z6stjynz.ufs.sh/f/nEev6VX4XfKEqo3zaDIInNK8kJlzwGpxeOijdSYC2VZAs1XP",
    github: "https://github.com/Gousemoideen",
    linkedin: "https://www.linkedin.com/in/gousemoideen/"
  },
  {
    name: "Sri Saidhakshini V",
    role: "Lead Developer",
    category: "lead",
    tagline: "UI/UX interactions & smooth transitions wizard.",
    gradient: "from-[#FCDDEC] to-[#D63384]",
    photo: "https://h8z6stjynz.ufs.sh/f/nEev6VX4XfKEHHbAQd1ltk8sCVhvgKTpUzQyXnafuj70O5i4",
    github: "https://github.com/srisaidhakshini",
    linkedin: "https://www.linkedin.com/in/sri-saidhakshini-venkatesan-bb4617382/"
  },
  {
    name: "Sravan Kowsik Gonuguntla",
    role: "UI/UX Lead",
    category: "design",
    tagline: "Designed FFCS Landing, Subject Dashboard, and Saved Timetables pages.",
    gradient: "from-[#FFDEEB] to-[#E64980]",
    photo: "https://h8z6stjynz.ufs.sh/f/nEev6VX4XfKEmEva2581z7EmicKQsBRL9TgSbxtVXpZnuPqw",
    github: "https://github.com/sravannotshravan",
    linkedin: "https://www.linkedin.com/in/sravan-kowsik-gonuguntla-555341292/"
  },
  {
    name: "Rahul",
    role: "Developer",
    category: "fullstack",
    tagline: "Auth, teams page, share timetable page & timetable page layouts.",
    gradient: "from-[#FFE094] to-[#FD7E14]",
    photo: "https://h8z6stjynz.ufs.sh/f/dummy_rahul",
    github: "https://github.com/sd-rahulk",
    linkedin: "https://www.linkedin.com/in/rahul-kamaraj10"
  },
  {
    name: "Subhayan Niyogi",
    role: "Developer",
    category: "frontend",
    tagline: "Preferences page developer.",
    gradient: "from-[#C5F6FA] to-[#0B7285]",
    photo: "https://h8z6stjynz.ufs.sh/f/nEev6VX4XfKENp1DkzcJYjwsBLCbSNUMGi76gpR4tA0OayfV",
    github: "https://github.com/hello-lab",
    linkedin: "https://linkedin.com/subhayan-niyogi"
  },
  {
    name: "Vishu Jain",
    role: "Developer",
    category: "fullstack",
    tagline: "Built the responsive landing page for the FFCS Planner.",
    gradient: "from-[#E5DBFF] to-[#6f42c1]",
    photo: "https://h8z6stjynz.ufs.sh/f/nEev6VX4XfKE8ZM42zqLQ2xVrP4AaXvOqzW0g1dcDfemSwsp",
    github: "https://github.com/vishucs50",
    linkedin: "https://linkedin.com/in/vishu-jain"
  },
  {
    name: "Surya R",
    role: "Developer",
    category: "frontend",
    tagline: "Grid components & interactive slots modularizer.",
    gradient: "from-[#FFD8A8] to-[#E8590C]",
    photo: "https://h8z6stjynz.ufs.sh/f/dummy_surya",
    github: "https://github.com/dummy",
    linkedin: "https://linkedin.com/in/dummy"
  },
  {
    name: "Souptik Dam",
    role: "Developer",
    category: "fullstack",
    tagline: "Clash-detection logic & optimization builder.",
    gradient: "from-[#D3F9D8] to-[#2B8A3E]",
    photo: "https://h8z6stjynz.ufs.sh/f/dummy_souptik",
    github: "https://github.com/dummy",
    linkedin: "https://linkedin.com/in/dummy"
  },
  {
    name: "Akash Vishnu P",
    role: "Developer",
    category: "design",
    tagline: "Built the saved page.",
    gradient: "from-[#FFF3BF] to-[#F59F00]",
    photo: "https://h8z6stjynz.ufs.sh/f/nEev6VX4XfKEWcJRaQxWChfmZ1kq57BVItpdrGLNHsS8TugD",
    github: "https://github.com/AkashVishnu-P",
    linkedin: "https://www.linkedin.com/in/akashvishnu-p/"
  },
  {
    name: "Udarsh Goyal",
    role: "Developer",
    category: "frontend",
    tagline: "Built the simplified version page of the planner.",
    gradient: "from-[#FFD8A8] to-[#E8590C]",
    photo: "https://h8z6stjynz.ufs.sh/f/dummy_udarsh",
    github: "https://github.com/udarshcode",
    linkedin: "https://www.linkedin.com/in/udarsh-goyal-256095383/"
  }
];

export default function TeamPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [floatingTiles, setFloatingTiles] = useState<FloatingTile[]>([]);
  const floatingContainerRef = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = React.useCallback(() => {
    clearPlannerClientCache({ includeEditingState: true });
    signOut({ callbackUrl: "/" });
  }, []);

  // Inactivity Logout Logic (e.g., 30 minutes of inactivity)
  React.useEffect(() => {
    if (!session) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleLogout();
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Track user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer(); // Initialize timer

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [session, handleLogout]);

  React.useEffect(() => {
    const container = floatingContainerRef.current;
    if (!container) return;

    const makeInitialTiles = (width: number, height: number): FloatingTile[] => {
      const maxX = Math.max(0, width - FLOATING_TILE_SIZE);
      const maxY = Math.max(0, height - FLOATING_TILE_SIZE);
      return FLOATING_TILE_LAYOUT.map((seed, idx) => ({
        id: idx,
        letter: seed.letter,
        color: seed.color,
        x: seed.xPct * maxX,
        y: seed.yPct * maxY,
        vx: seed.vx * 0.82,
        vy: seed.vy * 0.82,
        baseAngle: seed.angle,
        angle: seed.angle,
        rotAmplitude: 15 + ((idx * 2) % 11),
        rotSpeed: (idx % 2 === 0 ? 1 : -1) * (0.00044 + idx * 0.00003),
        rotPhase: idx * 0.7,
        depth: 0,
        depthPhase: idx * 0.8,
        wobblePhase: idx * 1.2,
        vibrationPhase: idx * 1.7,
        jitterX: 0,
        jitterY: 0
      }));
    };

    const initializeTiles = () => {
      const bounds = container.getBoundingClientRect();
      setFloatingTiles(makeInitialTiles(bounds.width, bounds.height));
    };

    initializeTiles();

    let rafId = 0;
    let lastTime = performance.now();

    const stepAnimation = (now: number) => {
      const elapsed = Math.min(36, now - lastTime);
      const dt = elapsed / 16.666;
      lastTime = now;

      const bounds = container.getBoundingClientRect();
      const maxX = Math.max(0, bounds.width - FLOATING_TILE_SIZE);
      const maxY = Math.max(0, bounds.height - FLOATING_TILE_SIZE);

      setFloatingTiles((prev) => {
        if (prev.length === 0) return prev;

        const next = prev.map((tile) => {
          const driftX = Math.sin(now * 0.00045 + tile.wobblePhase) * 0.016;
          const driftY = Math.cos(now * 0.00037 + tile.wobblePhase * 1.25) * 0.016;
          let vx = (tile.vx + driftX * dt) * 0.996;
          let vy = (tile.vy + driftY * dt) * 0.996;

          const maxSpeed = 0.44;
          const speed = Math.hypot(vx, vy);
          if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            vx *= scale;
            vy *= scale;
          }

          let x = tile.x + vx * dt;
          let y = tile.y + vy * dt;

          if (x <= 0) {
            x = 0;
            vx = Math.abs(vx) * 0.94;
          } else if (x >= maxX) {
            x = maxX;
            vx = -Math.abs(vx) * 0.94;
          }

          if (y <= 0) {
            y = 0;
            vy = Math.abs(vy) * 0.94;
          } else if (y >= maxY) {
            y = maxY;
            vy = -Math.abs(vy) * 0.94;
          }

          const angleSwing = Math.sin(now * tile.rotSpeed + tile.rotPhase) * tile.rotAmplitude;
          const buzzRotate = Math.sin(now * 0.032 + tile.vibrationPhase * 1.7) * 1.6;
          const angle = tile.baseAngle + angleSwing + buzzRotate;
          const depth = Math.sin(now * 0.0005 + tile.depthPhase);
          const jitterX =
            Math.sin(now * 0.022 + tile.vibrationPhase) * 0.7 +
            Math.sin(now * 0.049 + tile.vibrationPhase * 1.9) * 0.42;
          const jitterY =
            Math.cos(now * 0.02 + tile.vibrationPhase * 1.2) * 0.56 +
            Math.cos(now * 0.053 + tile.vibrationPhase * 2.1) * 0.35;

          return {
            ...tile,
            x,
            y,
            vx,
            vy,
            angle,
            depth,
            jitterX,
            jitterY
          };
        });

        const minDist = FLOATING_TILE_SIZE * 0.82;
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dx = next[j].x - next[i].x;
            const dy = next[j].y - next[i].y;
            const distance = Math.hypot(dx, dy);
            if (distance <= 0 || distance >= minDist) continue;

            const nx = dx / distance;
            const ny = dy / distance;
            const overlap = minDist - distance;

            next[i].x -= nx * overlap * 0.52;
            next[i].y -= ny * overlap * 0.52;
            next[j].x += nx * overlap * 0.52;
            next[j].y += ny * overlap * 0.52;

            const relVx = next[j].vx - next[i].vx;
            const relVy = next[j].vy - next[i].vy;
            const alongNormal = relVx * nx + relVy * ny;

            if (alongNormal < 0) {
              const impulse = -alongNormal * 0.28;
              next[i].vx -= impulse * nx;
              next[i].vy -= impulse * ny;
              next[j].vx += impulse * nx;
              next[j].vy += impulse * ny;
            }

            next[i].x = Math.max(0, Math.min(maxX, next[i].x));
            next[i].y = Math.max(0, Math.min(maxY, next[i].y));
            next[j].x = Math.max(0, Math.min(maxX, next[j].x));
            next[j].y = Math.max(0, Math.min(maxY, next[j].y));
          }
        }

        return next;
      });

      rafId = window.requestAnimationFrame(stepAnimation);
    };

    rafId = window.requestAnimationFrame(stepAnimation);

    const resizeObserver = new ResizeObserver(() => {
      const bounds = container.getBoundingClientRect();
      const maxX = Math.max(0, bounds.width - FLOATING_TILE_SIZE);
      const maxY = Math.max(0, bounds.height - FLOATING_TILE_SIZE);
      setFloatingTiles((prev) => {
        if (prev.length === 0) {
          return makeInitialTiles(bounds.width, bounds.height);
        }
        return prev.map((tile) => ({
          ...tile,
          x: Math.max(0, Math.min(maxX, tile.x)),
          y: Math.max(0, Math.min(maxY, tile.y))
        }));
      });
    });

    resizeObserver.observe(container);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);
  return (
    <div className="landing-page min-h-screen flex flex-col justify-between bg-[#FFF8E7] relative overflow-hidden select-none">
      
      {/* Decorative Aurora Glowing Orbs */}
      <div className="absolute top-24 left-[-100px] w-96 h-96 rounded-full bg-blue-200/20 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-[40%] right-[-150px] w-[500px] h-[500px] rounded-full bg-purple-200/15 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute bottom-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-emerald-200/15 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>

      <div className="white-container z-10 w-full">
        {/* Navbar */}
        <nav className="navbar px-6 md:px-10">
          <div className="logo cursor-pointer flex items-center transition-transform hover:scale-[1.03]" onClick={() => router.push('/')}>
            <Image src="/mic-logo.png" alt="MIC Logo" width={80} height={40} className="object-contain" priority />
          </div>
          {session ? (
            <div className="relative">
              <div
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity py-1.5 px-3 rounded-full bg-white/70 border border-[#eadcc5]/60 hover:shadow-sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {session.user?.image && (
                  <Image src={session.user.image} alt="avatar" width={30} height={30} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                )}
                <div className="profile-info-container">
                  <span className="profile-name-text font-bold text-gray-900 text-sm">
                    {parseName(session.user?.name).name}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-full min-w-[170px] bg-white/95 backdrop-blur-md border border-[#eadcc5]/80 rounded-2xl shadow-xl z-20 p-1.5 animate-in zoom-in-95 duration-200">
                    <button
                      className="w-full text-left px-3.5 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50/70 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button className="login-btn transition-transform hover:scale-[1.03]" onClick={() => setShowLogin(true)}>Login with Google</button>
          )}
        </nav>
        {showLogin && (
          <LoginModal onClose={() => setShowLogin(false)} />
        )}

        {/* Hero Section & Team Grid */}
        <section className="px-6 md:px-12 py-12 md:py-20 max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-center max-w-3xl mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-900 bg-clip-text text-transparent">
              Behind the Planner
            </h1>
            <p className="text-base md:text-lg font-semibold leading-relaxed text-gray-600 pb-6">
              Meet the builders, engineers, and designers from the Microsoft Innovations Club who crafted your ultimate, frictionless FFCS planning companion.
            </p>
          </div>

          {/* Redesigned Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 w-full mt-6 md:mt-10">
            {TEAM_MEMBERS.map((member, index) => {
              const initials = member.name
                .split(' ')
                .map(part => part[0])
                .join('')
                .substring(0, 2);

              return (
                <div
                  key={member.name}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-[#eadcc5]/70 bg-white/40 backdrop-blur-md px-6 py-4 md:px-7 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/70 hover:border-[#3B5BDB]/45 hover:shadow-[0_20px_45px_rgba(59,91,219,0.06)]"
                  style={{
                    animation: `lucidFadeUp 0.4s ease-out both`,
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div>
                    {/* Glowing Avatar */}
                    <div className="relative mb-5 flex justify-center">
                      <div className={`relative w-20 h-20 md:w-22 md:h-22 rounded-2xl bg-gradient-to-tr ${member.gradient} flex items-center justify-center text-white text-3xl font-black shadow-md transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-lg group-hover:ring-4 group-hover:ring-[#A0C4FF]/30`}>
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="absolute inset-0 w-full h-full rounded-2xl object-cover z-10 transition-transform duration-300"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span className="absolute inset-0 flex items-center justify-center font-black select-none pointer-events-none z-0">
                          {initials}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="text-center">
                      <h3 className="text-lg py-1 md:text-xl font-black text-gray-950 tracking-tight mb-1">
                        {member.name}
                      </h3>
                      <div className="inline-block px-3 py-1 rounded-full bg-[#A0C4FF]/15 text-[#3B5BDB] text-xs font-extrabold tracking-wide uppercase mb-3">
                        {member.role}
                      </div>
                      <p className="text-[13px] md:text-[14px] py-1 font-semibold leading-relaxed text-gray-600 px-2 mt-1">
                        {member.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="flex justify-center gap-3.5 mt-6 pt-2 border-t border-[#eadcc5]/30">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/60 text-gray-600 hover:text-gray-950 hover:bg-white hover:scale-108 hover:shadow-sm transition-all duration-200 cursor-pointer"
                      aria-label={`${member.name} GitHub profile`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/60 text-gray-600 hover:text-[#3B5BDB] hover:bg-white hover:scale-108 hover:shadow-sm transition-all duration-200 cursor-pointer"
                      aria-label={`${member.name} LinkedIn profile`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="footer-container z-10">
        <div className="footer-top">
          <div className="binding-rings">
            <div className="ring" style={{ background: '#fbcfe8' }}></div>
            <div className="ring" style={{ background: '#bfdbfe' }}></div>
            <div className="ring" style={{ background: '#a7f3d0' }}></div>
            <div className="ring" style={{ background: '#fde047' }}></div>
            <div className="ring" style={{ background: '#c4b5fd' }}></div>
            <div className="ring" style={{ background: '#bbf7d0' }}></div>
            <div className="ring" style={{ background: '#fbcfe8' }}></div>
          </div>
        </div>

        <div className="footer-main">
          <div className="footer-grid">
            <div className="f-block f-about">
              <h3>FFCS</h3>
              <p>
                The Fully Flexible Credit System (FFCS) planning tool helps VIT Chennai students organize their course selections before registration. Create multiple timetables, compare schedules, and prepare for seamless FFCS registration with our intelligent course and slot management system.
              </p>
            </div>

            <div className="f-block f-buttons">
              <button className="f-btn f-btn-gen" onClick={() => router.push('/preferences')}>
                <Image src="/calendar_icon2.png" alt="calendar" width={32} height={32} />
                <span>Generate<br />timetable</span>
              </button>
              <button
                className="f-btn f-btn-saved"
                onClick={() => {
                  if (!session) {
                    setShowLogin(true);
                  } else {
                    router.push('/saved');
                  }
                }}
              >
                <Image src="/Clock.png" alt="clock" width={32} height={32} />
                <span>View saved<br />timetables</span>
              </button>
              <button className="f-btn f-btn-slots" onClick={() => router.push('/slots')}>
                <Image src="/slot_icon.png" alt="slot" width={32} height={32} />
                <span>View slots</span>
              </button>
              <button className="f-btn f-btn-team" onClick={() => router.push('/')}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="32"
                  height="32"
                  aria-hidden="true"
                >
                  <path d="M3 10.5L12 3l9 7.5" />
                  <path d="M5 9.5V21h14V9.5" />
                  <path d="M9 21v-6h6v6" />
                </svg>
                <span>Go home</span>
              </button>
            </div>

            <div className="f-block f-graphics" ref={floatingContainerRef}>
              {floatingTiles.map((tile) => {
                const scale = 0.96 + (tile.depth + 1) * 0.05;
                const zDepth = Math.round(tile.depth * 10);
                return (
                  <div
                    key={tile.id}
                    className="floating-tile"
                    style={{
                      background: tile.color,
                      transform: `translate3d(${tile.x}px, ${tile.y}px, ${zDepth}px) rotate(${tile.angle}deg) scale(${scale})`,
                      zIndex: Math.round((tile.depth + 1) * 10)
                    }}
                  >
                    {tile.letter}
                  </div>
                );
              })}
            </div>

            <div className="f-block f-credits flex flex-col justify-center items-center gap-1 py-2">
              <span>Built with ❤️ by Microsoft Innovations Club</span>
              <div className="flex gap-4">
                <Link href="/privacy" className="text-xs text-[#3B5BDB] hover:underline font-bold tracking-widest uppercase">
                  Privacy Policy
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/terms" className="text-xs text-[#3B5BDB] hover:underline font-bold tracking-widest uppercase">
                  Terms of Service
                </Link>
              </div>
            </div>

            <div className="f-block f-updates" style={{ padding: '8px' }}>
              <button
                onClick={() => router.push('/feedback')}
                className="w-full flex items-center justify-center gap-2 bg-[#BFDBFE] hover:bg-[#93C5FD] transition-colors rounded-lg cursor-pointer"
                style={{ height: '40px', width: '100%', border: 'none', fontWeight: 700, fontSize: '15px', color: '#000' }}
              >
                Give feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
