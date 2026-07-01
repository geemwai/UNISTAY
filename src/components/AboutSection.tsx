import React from "react";
import { Sparkles, Shield, Compass, CheckCircle, Users } from "lucide-react";

interface AboutSectionProps {
  onNavigate?: (view: string) => void;
}

export default function AboutSection({ onNavigate }: AboutSectionProps) {
  return (
    <section className="py-20 bg-slate-900 text-slate-300 border-t border-slate-850">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-orange-500" /> About UNISTAY
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            Kenya's Premier Student Housing Finder
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-medium">
            We bridge the gap between students and high-quality, verified accommodation, eliminating stressful searches and third-party agent exploitation.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
          
          <div className="bg-slate-950/60 border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-orange-500/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-slate-950 transition-all">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Stress-Free Discovery</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Explore listings tailored for your campus with robust filters for room type, nearby university, proximity, and max budget.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-orange-500/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-slate-950 transition-all">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Guarded Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              To keep our platform secure and prevent fraudulent postings, precise listing locations are exclusively accessible to verified platform administrators.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-orange-500/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-slate-950 transition-all">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Direct Landlord Access</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Connect directly with listing owners via WhatsApp inside our detailed modals without paying middleman booking fees.
            </p>
          </div>

        </div>

        {/* How It Works Block */}
        <div className="bg-slate-950 border border-slate-850 rounded-3xl p-8 sm:p-12 text-left relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-orange-500 rounded-full blur-[96px] opacity-10 pointer-events-none" />
          
          <div className="max-w-3xl space-y-6">
            <h3 className="text-2xl font-black text-slate-100">How UNISTAY Works</h3>
            <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
              Finding off-campus housing shouldn't be a gamble. UNISTAY simplifies finding host family spots, bedsitters, and student rooms near major institutions in Nairobi and throughout Kenya.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Search Your Campus Zone</h4>
                  <p className="text-xs text-slate-400 font-medium">Filter host profiles based on proximity and university initials.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Submit Inquiry</h4>
                  <p className="text-xs text-slate-400 font-medium">Verified student profiles can request more photos or send direct WhatsApp messages instantly.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Safe Onboarding</h4>
                  <p className="text-xs text-slate-400 font-medium">Receive direct confirmation of availability, check out room policies, and pay rent straight to landlords securely.</p>
                </div>
              </div>
            </div>

            {onNavigate && (
              <div className="pt-4">
                <button
                  onClick={() => onNavigate("listings")}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold text-sm tracking-wide transition-all cursor-pointer shadow-lg shadow-orange-500/10"
                >
                  Explore Available Rooms
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}