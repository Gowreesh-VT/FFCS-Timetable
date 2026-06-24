import React from "react";
import "./mobile.css";
import Image from "next/image";
import Link from "next/link";
export default function MobilePage() {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-white font-sans text-black overflow-hidden items-center justify-between">
        {/* Top Section */}
        <h1 className="text-[54px] font-[800] tracking-[-0.02em] mt-24 leading-none">
          FFCS
        </h1>

        {/* Middle icon */}
        <div className="flex-1 flex  items-center justify-center -mt-16 w-full">
          <div className="phone-anim w-[115px] h-[230px] border-[5px] border-black rounded-[8px] flex flex-col items-center pt-3 relative">
            <div className="w-[7px] h-[7px] bg-black rounded-full"></div>
            <div className="flex-1 flex items-center justify-center pb-4 text-[17px] font-bold tracking-tight">
              FFCS
            </div>
            <div className="screen-image absolute inset-0">
              <Image
                src="/preview2.png"
                alt="preview"
                fill
                className="object-fill"
                priority
              />
            </div>
            <div className="device-bar "></div>  
          </div>
        </div>

        {/* Bottom Text Area */}
        <div className="flex flex-col items-center px-6 text-center w-full pb-12">
          <h2 className="text-[42px] font-[800] leading-[1.05] tracking-tight mb-[18px] text-[#000000]">
            Looks like you are on
            <br />
            mobile
          </h2>
          <p className="text-[21px] leading-[1.3] text-[#000000] font-[400]">
            For the best experience, please use a<br />
            computer to access this website.
          </p>
        </div>

        {/* Footer Area */}
        <div className="w-full bg-[#FAFAFA] pt-4 pb-4 flex flex-col items-center justify-center text-[15px] border-t border-gray-100 shadow-[0_-20px_40px_rgba(0,0,0,0.015)] gap-1">
          <p className="mb-0 text-black font-[400] text-center">
            Built with <span className="text-[#FF3B30]">❤️</span> by Microsoft Innovations Club
          </p>
          <div className="flex gap-4">
            <Link 
              href="/privacy" 
              className="text-xs text-[#3b5bdb] hover:underline font-bold tracking-widest uppercase"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href="/terms" 
              className="text-xs text-[#3b5bdb] hover:underline font-bold tracking-widest uppercase"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    );
}
