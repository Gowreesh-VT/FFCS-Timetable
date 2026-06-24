'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Section {
  id: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'information-collected', title: '2. Information We Collect' },
  { id: 'how-we-use', title: '3. How We Use Information' },
  { id: 'third-party', title: '4. Third-Party Services' },
  { id: 'cookies-storage', title: '5. Cookies & Local Storage' },
  { id: 'data-security', title: '6. Data Security & Retention' },
  { id: 'user-choices', title: '7. Your Choices & Deletion' },
  { id: 'policy-changes', title: '8. Changes to This Policy' },
  { id: 'contact-us', title: '9. Contact Us' },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string>('introduction');

  useEffect(() => {
    const visibleSections: Record<string, boolean> = {};

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        visibleSections[entry.target.id] = entry.isIntersecting;
      });

      // Find the first visible section in DOM order
      const active = SECTIONS.find((section) => visibleSections[section.id]);
      if (active) {
        setActiveSection(active.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-15% 0px -75% 0px',
      threshold: 0.05,
    });

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => {
      SECTIONS.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // Adjust header offset
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] text-[#171717] font-body transition-colors duration-300">
      {/* Decorative Top Bar */}
      <div className="w-full h-2 bg-gradient-to-r from-[#A0C4FF] via-[#BFA5EE] to-[#B8EDC0] sticky top-0 z-50" />

      {/* Header Container */}
      <header className="sticky top-2 z-40 w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full bg-white/70 backdrop-blur-md border border-[#eadcc5]/80 rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-all">
            <Image src="/mic-logo.png" alt="MIC Logo" width={36} height={36} className="rounded-lg shadow-sm" />
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg sm:text-xl tracking-wider text-[#171717]">
                FFCS PLANNER
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                by MIC VIT Chennai
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-[#3B5BDB] hover:bg-[#2B43A6] text-white rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95 duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Layout */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full">
          {/* Title Section */}
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#171717] mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500 font-medium tracking-wide">
              Last Updated: June 22, 2026 • Effective Date: June 22, 2026
            </p>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Left Column - Desktop Table of Contents (Sticky Wrapper) */}
          <div className="hidden lg:block lg:col-span-1">
            <aside className="sticky top-28 bg-white/50 border border-[#eadcc5]/70 rounded-2xl p-6 shadow-sm">
              <h3 className="font-heading font-bold text-[#171717] text-sm uppercase tracking-widest mb-4">
                Table of Contents
              </h3>
              <nav className="flex flex-col gap-2">
                {SECTIONS.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`text-left text-sm py-2 px-3 rounded-lg font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#3B5BDB] text-white shadow-sm translate-x-1'
                          : 'text-gray-500 hover:text-[#171717] hover:bg-white/70'
                      }`}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>

          {/* Right Column - Content Panel */}
          <div className="lg:col-span-3 min-w-0 bg-white border border-[#eadcc5] rounded-3xl p-6 sm:p-10 shadow-sm leading-relaxed text-[16px] sm:text-[17px] text-gray-700">
            {/* Mobile Table of Contents Scroll list */}
            <div className="lg:hidden bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">
                Jump to Section
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`snap-center shrink-0 text-xs py-1.5 px-3 rounded-lg font-bold border transition-colors ${
                      activeSection === section.id
                        ? 'bg-[#3B5BDB] text-white border-[#3B5BDB]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {section.title.split('. ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Introduction */}
            <section id="introduction" className="scroll-mt-24 space-y-4 py-6 sm:py-8">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] flex items-center gap-3">
                <span className="w-2 h-6 bg-[#A0C4FF] rounded-full" />
                1. Introduction
              </h2>
              <p>
                Welcome to the <strong>FFCS Timetable Planner</strong> (referred to as &quot;FFCS Planner,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). 
                The FFCS Planner is an open-source tool designed and maintained by the 
                <strong> Microsoft Innovations Club (MIC)</strong> at <strong>VIT Chennai</strong>. It is created to assist students in organizing, scheduling, 
                and planning their timetables before their official Fully Flexible Credit System (FFCS) course registration.
              </p>
              <p>
                We respect your privacy and are committed to protecting any personal data you share with us. This Privacy Policy details how we collect, 
                store, process, and protect your information when you access and use our application. By using the FFCS Planner, you agree to the practices 
                described here.
              </p>
            </section>

            <div className="py-2"><hr className="border-gray-100" /></div>

            {/* 2. Information We Collect */}
            <section id="information-collected" className="scroll-mt-24 space-y-4 py-6 sm:py-8">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] flex items-center gap-3">
                <span className="w-2 h-6 bg-[#BFA5EE] rounded-full" />
                2. Information We Collect
              </h2>
              <p>
                To provide you with custom scheduling and synchronization capabilities, we collect the following types of information:
              </p>
              <div className="space-y-4 pl-2">
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                  <h4 className="font-bold text-[#171717] mb-1">A. Authentication & Account Data</h4>
                  <p className="text-sm">
                    When you sign in using Google OAuth, we receive your Google account email address, display name, and profile picture. 
                    <strong> Please note:</strong> sign-in is restricted exclusively to valid VIT Chennai/Vellore student accounts 
                    (ending in <code>@vitstudent.ac.in</code>).
                  </p>
                </div>
                <div className="bg-[#FFF8E7]/50 border border-[#eadcc5]/70 rounded-xl p-4">
                  <h4 className="font-bold text-[#171717] mb-1">B. Application & Planning Data</h4>
                  <p className="text-sm">
                    We save the timetables you create, including chosen courses, professors, specific slot combinations, saved schedules, and 
                    favorite lists. This data is linked to your account to let you access it across multiple devices.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <h4 className="font-bold text-[#171717] mb-1">C. Technical & Usage Analytics</h4>
                  <p className="text-sm">
                    We collect anonymized usage details and metrics (such as button clicks, page transitions, and feature engagements) via 
                    <strong> PostHog</strong> and <strong>Vercel Analytics</strong>. For debugging, we log error messages and performance details 
                    via <strong>Sentry</strong> and <strong>Vercel Speed Insights</strong>.
                  </p>
                </div>
              </div>
            </section>

            <div className="py-2"><hr className="border-gray-100" /></div>

            {/* 3. How We Use Information */}
            <section id="how-we-use" className="scroll-mt-24 space-y-4 py-6 sm:py-8">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] flex items-center gap-3">
                <span className="w-2 h-6 bg-[#B8EDC0] rounded-full" />
                3. How We Use Information
              </h2>
              <p>
                We use the data collected strictly for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Delivery:</strong> To store and retrieve your custom timetables so you can build, edit, and export them.</li>
                <li><strong>Synchronization:</strong> To sync your data between your devices using NextAuth session management.</li>
                <li><strong>Performance Tuning:</strong> To monitor system health, locate bugs, and prevent app crashes using Sentry.</li>
                <li><strong>Product Analytics:</strong> To understand how students interact with features, helping us optimize the UI flow and registration speed.</li>
                <li><strong>Community Improvements:</strong> We may analyze aggregated, non-personally identifiable scheduling statistics (e.g., most popular courses or slots) to enhance next-semester planner tools.</li>
              </ul>
            </section>

            <div className="py-2"><hr className="border-gray-100" /></div>

            {/* 4. Third-Party Services */}
            <section id="third-party" className="scroll-mt-24 space-y-4 py-6 sm:py-8">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] flex items-center gap-3">
                <span className="w-2 h-6 bg-[#F9EEAA] rounded-full" />
                4. Third-Party Services
              </h2>
              <p>
                We work with external service providers to handle hosting, analytics, and authentication securely. We do not sell or lease student data. Our trusted partners include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google OAuth:</strong> Facilitates student login. They process your profile details under Google&apos;s standard terms.</li>
                <li><strong>MongoDB Atlas:</strong> Secure cloud storage where database tables (users, timetables) are safely stored.</li>
                <li><strong>PostHog:</strong> Provides product usage and behavior tracking. All tracking data is collected in compliance with standard analytics practices.</li>
                <li><strong>Sentry:</strong> Reports application errors, helping us resolve crashes rapidly.</li>
                <li><strong>Vercel:</strong> Our hosting infrastructure, which tracks technical speed metrics and page request statistics.</li>
              </ul>
            </section>

            <div className="py-2"><hr className="border-gray-100" /></div>

            {/* 5. Cookies & Local Storage */}
            <section id="cookies-storage" className="scroll-mt-24 space-y-4 py-6 sm:py-8">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] flex items-center gap-3">
                <span className="w-2 h-6 bg-[#BDD7FF] rounded-full" />
                5. Cookies & Local Storage
              </h2>
              <p>
                The FFCS Planner uses essential cookies and local storage tokens to function:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Authentication Cookies:</strong> Managed by NextAuth to verify your identity and keep you securely logged in.</li>
                <li><strong>Local Storage:</strong> Used to temporarily cache course selections, active preferences, and tour onboarding states. This ensures you do not lose progress if your internet connection fluctuates.</li>
              </ul>
              <p>
                You can configure your browser to block cookies or clear your local storage; however, doing so will sign you out and require you to build schedules as a guest without cloud saving.
              </p>
            </section>

            <div className="py-2"><hr className="border-gray-100" /></div>

            {/* 6. Data Security & Retention */}
            <section id="data-security" className="scroll-mt-24 space-y-4 py-6 sm:py-8">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] flex items-center gap-3">
                <span className="w-2 h-6 bg-[#E0D4F5] rounded-full" />
                6. Data Security & Retention
              </h2>
              <p>
                We implement industrial-standard physical, electronic, and administrative safeguards to prevent unauthorized access or alteration of student data. All API communications are encrypted via HTTPS.
              </p>
              <p>
                We retain your saved schedules, favorites, and profile data as long as your account is active, or as needed to support your planning throughout the academic semester. Once the timetables are no longer required, we purge inactive data periodically.
              </p>
            </section>

            <div className="py-2"><hr className="border-gray-100" /></div>

            {/* 7. Your Choices & Deletion */}
            <section id="user-choices" className="scroll-mt-24 space-y-4 py-6 sm:py-8">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] flex items-center gap-3">
                <span className="w-2 h-6 bg-[#FFD6E0] rounded-full" />
                7. Your Choices & Deletion
              </h2>
              <p>
                You have full control over your timetable data. You can delete saved timetables directly inside the dashboard.
              </p>
              <p>
                If you wish to completely delete your account record, Google profile link, and all saved schedule data from our database, please contact our team via the 
                <strong> Give feedback</strong> button in the footer or email us at <a href="mailto:mic.vit.chennai@gmail.com" className="text-[#3B5BDB] font-bold hover:underline">mic.vit.chennai@gmail.com</a>. We will process your deletion request within 48-72 hours.
              </p>
            </section>

            <div className="py-2"><hr className="border-gray-100" /></div>

            {/* 8. Changes to This Policy */}
            <section id="policy-changes" className="scroll-mt-24 space-y-4 py-6 sm:py-8">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] flex items-center gap-3">
                <span className="w-2 h-6 bg-[#B8F0E0] rounded-full" />
                8. Changes to This Policy
              </h2>
              <p>
                We may revise this Privacy Policy from time to time to accommodate new features, security updates, or service changes. If we make material modifications, we will update the &quot;Last Updated&quot; date at the top of this page. We encourage you to review this page periodically to remain informed about how we protect student data.
              </p>
            </section>

            <div className="py-2"><hr className="border-gray-100" /></div>

            {/* 9. Contact Us */}
            <section id="contact-us" className="scroll-mt-24 space-y-4 py-6 sm:py-8">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] flex items-center gap-3">
                <span className="w-2 h-6 bg-[#A0C4FF] rounded-full" />
                9. Contact Us
              </h2>
              <p>
                If you have questions, feedback, or concerns regarding your privacy, account removal, or data storage, please reach out to us:
              </p>
              <div className="bg-[#FFF8E7] border border-[#eadcc5] rounded-2xl p-6 space-y-3">
                <p>
                  <strong>Club:</strong> Microsoft Innovations Club, VIT Chennai
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:mic.vit.chennai@gmail.com" className="text-[#3B5BDB] font-bold hover:underline">mic.vit.chennai@gmail.com</a>
                </p>
                <p>
                  <strong>Web:</strong> <a href="https://microsoftinnovations.club" target="_blank" rel="noopener noreferrer" className="text-[#3B5BDB] font-bold hover:underline">microsoftinnovations.club</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-[#eadcc5]/80 mt-16 text-center text-sm text-gray-500 font-semibold tracking-wider uppercase bg-white/30">
        <div>FFCS PLANNER © {new Date().getFullYear()}</div>
        <div className="mt-1 text-xs text-gray-400">DESIGNED & BUILT WITH ❤️ BY MICROSOFT INNOVATIONS CLUB</div>
      </footer>
    </div>
  );
}
