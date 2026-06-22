"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "@/components/loginPopup"
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { clearPlannerClientCache } from "@/lib/clientCache";
import { parseName } from "@/lib/utils";
import { useFeatureFlagEnabled } from "@posthog/react";
import { FEATURE_FLAGS } from "@/lib/featureFlags";

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

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  const [animatingTiles, setAnimatingTiles] = useState<Record<number, boolean>>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [floatingTiles, setFloatingTiles] = useState<FloatingTile[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);


  const floatingContainerRef = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const isSimplifiedEnabled = useFeatureFlagEnabled(FEATURE_FLAGS.simplifiedFlow);

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

  const handleTileClick = (index: number) => {
    setAnimatingTiles((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setAnimatingTiles((prev) => ({ ...prev, [index]: false }));
    }, 1000);
  };

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
        wobblePhase: idx * 1.2
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
          const angle = tile.baseAngle + angleSwing;
          const depth = Math.sin(now * 0.0005 + tile.depthPhase);

          return {
            ...tile,
            x,
            y,
            vx,
            vy,
            angle,
            depth
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
    <div className="landing-page">
      {/* Top Banner and Hero */}
      <div className="white-container">
        <nav className="navbar">
          <Link className="logo cursor-pointer flex items-center gap-2 md:gap-3" href="/">
            <Image src="/mic-logo.png" alt="MIC Logo" width={80} height={40} className="object-contain w-14 md:w-20 h-7 md:h-10" priority />
            <span className="font-extrabold text-[24px] md:text-[32px] tracking-wider text-black select-none">FFCS</span>
          </Link>
          {session ? (
            <div className="relative">
              <div
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity py-1.5 px-3 rounded-full bg-white/70 border border-[#eadcc5]/60 hover:shadow-sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {session.user?.image ? (
                  <Image src={session.user.image} alt="avatar" width={30} height={30} className="w-7.5 h-7.5 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7.5 h-7.5 rounded-full bg-[#8B6E60] text-white font-bold flex items-center justify-center text-xs shrink-0 select-none">
                    {parseName(session.user?.name).name[0]?.toUpperCase() || 'U'}
                  </div>
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

        <section className="hero-section">
          <div className="hero-text">
            <h1>Build Your Timetable</h1>
            <p>
              Plan your perfect timetable with our intuitive<br />
              course selection and slot management tools
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => setOpen(true)}>Get Started</button>
              {open && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6">
                  {/* Backdrop */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setOpen(false)}></div>
                  
                  {/* Modal Container */}
                  <div className="relative w-full max-w-4xl bg-[#FAFAFA] border border-gray-100 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] p-8 sm:p-12 overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                    <button 
                      onClick={() => setOpen(false)} 
                      className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white text-gray-500 hover:text-gray-900 transition-all duration-200 hover:scale-110 shadow-sm z-10 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      aria-label="Close modal"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    <div className="text-center mb-10 relative z-10">
                      <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight mb-3">
                        Welcome {session?.user?.name ? `back, ${session.user.name}` : "to FFCS"}!
                      </h2>
                      <p className="text-gray-500 text-lg font-medium">Choose what you&apos;d like to do next</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 relative z-10">
                      {isSimplifiedEnabled ? (
                        <>
                          <button
                            className="group relative flex flex-col items-center justify-start bg-white/70 hover:bg-white border border-white/80 rounded-[24px] p-6 text-center cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.12)] ring-1 ring-black/5"
                            onClick={() => {
                              setOpen(false);
                              router.push('/simplified');
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative z-10 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                               <Image src="/create_new.png" alt="create" width={100} height={100} className="object-contain drop-shadow-md" />
                            </div>
                            
                            <h3 className="relative z-10 font-bold text-gray-900 text-lg mb-2 group-hover:text-green-700 transition-colors">Course Selection</h3>
                            <p className="relative z-10 text-xs text-gray-500 leading-relaxed font-medium">Real-time search & single-page layout</p>
                            <div className="relative z-10 mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-100/80 text-green-700 text-[10px] font-bold tracking-wider uppercase border border-green-200/50 shadow-sm">Recommended</div>
                          </button>

                          <button
                            className="group relative flex flex-col items-center justify-start bg-white/70 hover:bg-white border border-white/80 rounded-[24px] p-6 text-center cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.12)] ring-1 ring-black/5"
                            onClick={() => {
                              setOpen(false);
                              router.push('/preferences');
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative z-10 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                               <Image src="/create_new.png" alt="advanced" width={100} height={100} className="object-contain hue-rotate-60 drop-shadow-md" />
                            </div>
                            
                            <h3 className="relative z-10 font-bold text-gray-900 text-lg mb-2 group-hover:text-amber-700 transition-colors">Advanced Preferences</h3>
                            <p className="relative z-10 text-xs text-gray-500 leading-relaxed font-medium">Classic step-by-step slot & faculty priorities</p>
                          </button>
                        </>
                      ) : (
                        <button 
                          className="group relative flex flex-col items-center justify-start bg-white/70 hover:bg-white border border-white/80 rounded-[24px] p-6 text-center cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.12)] ring-1 ring-black/5 md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-2" 
                          onClick={() => { setOpen(false); router.push('/preferences'); }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-green-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                            <Image src="/create_new.png" alt="create" width={100} height={100} className="object-contain drop-shadow-md" />
                          </div>
                          <h3 className="relative z-10 font-bold text-gray-900 text-lg mb-2 group-hover:text-green-700 transition-colors">Create a new one</h3>
                        </button>
                      )}
                      
                      <button
                        className="group relative flex flex-col items-center justify-start bg-white/70 hover:bg-white border border-white/80 rounded-[24px] p-6 text-center cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(168,85,247,0.12)] ring-1 ring-black/5"
                        onClick={() => {
                          if (!session) {
                            setOpen(false);
                            setShowLogin(true);
                          } else {
                            setOpen(false);
                            router.push("/saved");
                          }
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative z-10 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                           <Image src="/savedTimetable.png" alt="saved" width={100} height={100} unoptimized className="object-contain drop-shadow-md" />
                        </div>
                        
                        <h3 className="relative z-10 font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-700 transition-colors">Saved Timetables</h3>
                        <p className="relative z-10 text-xs text-gray-500 leading-relaxed font-medium">
                          {session ? "View and manage your saved timetables" : "Log in to view saved timetables"}
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <Link href="/slots" className="btn-secondary">Slot View</Link>
            </div>
          </div>
          <div className="hero-graphic">
            {/* Calendar pure CSS drawing */}
            <div className="calendar-graphic">
              <div className="cal-top">
                <div className="cal-tab" style={{ background: '#fbcfe8' }}></div>
                <div className="cal-tab" style={{ background: '#bfdbfe' }}></div>
                <div className="cal-tab" style={{ background: '#a7f3d0' }}></div>
                <div className="cal-tab" style={{ background: '#fde047' }}></div>
                <div className="cal-tab" style={{ background: '#c4b5fd' }}></div>
                <div className="cal-tab" style={{ background: '#bbf7d0' }}></div>
                <div className="cal-tab" style={{ background: '#fbcfe8' }}></div>
              </div>
              <div className="cal-grid">
                {[
                  '#93c5fd', '#fde047', '#bbf7d0', '#f3e8ff', '#fde047', '#fbcfe8',
                  '#93c5fd', '#bbf7d0', '#fde047', '#bbf7d0', '#c4b5fd', '#fde047',
                  '#93c5fd', '#bbf7d0', '#fde047', '#bbf7d0', '#c4b5fd', '#93c5fd',
                  '#d8b4e2', '#fde047', '#bbf7d0', '#c4b5fd', '#bbf7d0', '#fde047'
                ].map((color, idx) => (
                  <div
                    key={idx}
                    className={`cal-box ${animatingTiles[idx] ? 'animating' : ''}`}
                    style={{ background: color }}
                    onClick={() => handleTileClick(idx)}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Middle Sections */}
      <div className="middle-section">
        {/* How It Works */}
        <div className="how-it-works-card">
          <h2>How This Site Works?</h2>

          <div className="video-box" style={{ position: 'relative' }}>
            {!videoError ? (
              <>
                {/* Option A: Uploadthing Video Player (Active) */}
                <video
                  ref={videoRef}
                  src="https://h8z6stjynz.ufs.sh/f/nEev6VX4XfKE5CB0pMEvK0cVWaoY4UbStprle19NBx8f3nZT"
                  poster="/section1-preview.png"
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {!isVideoPlaying && (
                  <div className="play-icon-overlay" onClick={() => videoRef.current?.play()}>
                    <div className="play-icon-btn"></div>
                  </div>
                )}
              </>
            ) : (
              /* Option B: YouTube Player (Fallback if Uploadthing fails) */
              <iframe
                src="https://www.youtube-nocookie.com/embed/lv7asnSPVBw?rel=0&modestbranding=1"
                title="How FFCS Timetable Works"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            )}
          </div>

          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <p className="step-text">
                Select your courses and preferences. Choose from available courses based on your specialization and academic requirements.
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <p className="step-text">
                View available time slots for each course and build your timetable without conflicts. Our tool helps you avoid scheduling overlaps.
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <p className="step-text">
                Save your timetable and share it with classmates. Export your final schedule for reference during FFCS registration.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-card">
          <h2>Frequently asked questions:</h2>
          <div className="faq-list">
            {[
              {
                q: "Why use this site?",
                a: "Our FFCS planner helps you make informed decisions before registering for courses. Plan ahead, avoid schedule conflicts, and save time during the actual FFCS registration process. It's designed specifically for VIT's course system."
              },
              {
                q: "Can I generate multiple\ntimetable options?",
                a: "Yes! Simply add multiple teachers for a single subject, and our smart algorithm will automatically generate several clash-free timetable combinations for you."
              },
              {
                q: "Does it automatically handle\nTheory and Lab pairings?",
                a: "Absolutely! When you select a theory slot for a course, the corresponding lab slot is automatically selected for you (and vice-versa), ensuring perfect synchronization."
              },
              {
                q: "Can I share my timetable\nwith my friends?",
                a: "Yes! Once you generate your timetable, you can easily share a link with your friends to sync your schedules and find common free time."
              },
              {
                q: "Can I change my timetable\nafter saving?",
                a: "Yes, you can edit your saved timetables anytime. Make adjustments to your course selections and slot preferences before the FFCS registration deadline."
              }
            ].map((faq, index) => (
              (() => {
                const isOpen = activeFaq === index;
                return (
              <div
                key={index}
                className="faq-item"
                style={isOpen ? { background: 'transparent', transition: 'background 0.25s ease' } : { cursor: 'pointer', transition: 'background 0.25s ease' }}
              >
                <div className="faq-question" onClick={() => setActiveFaq(isOpen ? null : index)}>
                  <span>{faq.q.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && faq.q.includes('\n') ? <br /> : null}</React.Fragment>)}</span>
                  <span className="faq-icon" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>⌄</span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    opacity: isOpen ? 1 : 0,
                    transition: 'grid-template-rows 0.35s ease, opacity 0.2s ease',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div className="faq-answer">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
                );
              })()
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-container">
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
              <Link className="f-btn f-btn-gen" href="/preferences">
                <Image src="/calendar_icon2.png" alt="calendar" width={34} height={34} />
                <span>Generate<br />timetable</span>
              </Link>
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
                <Image src="/Clock.png" alt="clock" width={34} height={34} />
                <span>View saved<br />timetables</span>
              </button>
              <Link className="f-btn f-btn-slots" href="/slots">
                <Image src="/slot_icon.png" alt="slot" width={34} height={34} />
                <span>View slots</span>
              </Link>
              <Link className="f-btn f-btn-team" href="/team">
                <Image src="/team_icon.png" alt="team" width={34} height={34} />
                <span>View team</span>
              </Link>
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

            <div className="f-block f-credits">
              Built with ❤️ by Microsoft Innovations Club
            </div>

            <div className="f-block f-updates" style={{ padding: '8px' }}>
              <Link
                href="/feedback"
                className="w-full flex items-center justify-center gap-2 bg-[#BFDBFE] hover:bg-[#93C5FD] transition-colors rounded-lg cursor-pointer"
                style={{ height: '40px', width: '100%', border: 'none', fontWeight: 700, fontSize: '15px', color: '#000', textDecoration: 'none' }}
              >
                Give feedback
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
