import React from "react";
import { Search, Shield, BadgeCheck, Zap, ArrowRight } from "lucide-react";

interface HeroProps {
  onSearchClick: () => void;
  onOpenAuth: (tab: "login" | "register") => void;
  isLoggedIn: boolean;
}

export default function Hero({ onSearchClick, onOpenAuth, isLoggedIn }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-24 sm:py-32 border-b border-slate-900">
      {/* Background image overlay */}
      <div className="absolute inset-0 z-0 opacity-15 mix-blend-multiply bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1920&q=80')" }} />
      
      {/* Ambient circular highlights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500 rounded-full blur-[128px] opacity-20 z-0 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500 rounded-full blur-[128px] opacity-10 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              100% Free Campus Housing Hub
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Find Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                Student Home.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              Ditch the stress of house hunting. Discover premium, physically-verified shared rooms, bedsitters, and 1-bedroom apartments near your university campus. No brokers. No hidden fees. Just direct landlord contact.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onSearchClick}
                className="inline-flex items-center gap-2 px-6.5 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-base font-extrabold shadow-lg shadow-orange-500/10 cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                Browse Available Rooms
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              {!isLoggedIn && (
                <button
                  onClick={() => onOpenAuth("register")}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-base font-semibold border border-slate-800 hover:text-white cursor-pointer transition-colors"
                >
                  Create Student Account
                </button>
              )}
            </div>

            {/* Micro-Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-900">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">100% Verified</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Physical inspections</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Direct Contact</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Direct WhatsApp chat</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Zero Commissions</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Free for all students</p>
                </div>
              </div>
            </div>

          </div>

          {/* Graphical Premium Mockup */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-3xl blur-3xl opacity-10 transform rotate-6 scale-95 pointer-events-none" />
            <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
              
              {/* Card top */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] font-mono tracking-widest text-slate-400 bg-slate-950/60 px-2 py-1 rounded-md">
                  LIVE DIRECTORY
                </span>
              </div>

              {/* Showcase Room Card */}
              <div className="relative rounded-2xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80" 
                  alt="Student Room Preview" 
                  className="w-full h-52 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-orange-500 text-slate-950 text-[11px] font-black">
                  KSh 8,500/mo
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 to-transparent p-4 pt-10">
                  <p className="text-xs text-orange-400 font-bold tracking-wide">BEDSITTER</p>
                  <h3 className="text-base font-bold text-white mt-0.5">Elite Bedsitters, Juja</h3>
                  <p className="text-xs text-slate-300 mt-1">400m from JKUAT Main Gate</p>
                </div>
              </div>

              {/* Live interactive stats widget */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 border border-slate-800/45 p-3.5 rounded-xl text-center">
                  <span className="block text-2xl font-black text-orange-400">120+</span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rooms Listed</span>
                </div>
                <div className="bg-slate-950/50 border border-slate-800/45 p-3.5 rounded-xl text-center">
                  <span className="block text-2xl font-black text-emerald-400">100%</span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
