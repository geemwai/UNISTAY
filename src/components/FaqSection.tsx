import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageCircle } from "lucide-react";
import { FAQ } from "../types";

interface FaqSectionProps {
  faqs: FAQ[];
  whatsappNumber?: string;
}

export default function FaqSection({ faqs, whatsappNumber = "+254712345678" }: FaqSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const handleWhatsAppContact = () => {
    const defaultText = "Hello UNISTAY, I have a question regarding student room bookings.";
    const encodedText = encodeURIComponent(defaultText);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-20 bg-slate-950 min-h-screen border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-orange-500" /> Need Help?
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-medium">
            Clear, honest answers to make your student accommodation booking experience smooth and stress-free.
          </p>
        </div>

        {/* FAQs Accordion */}
        {faqs.length > 0 ? (
          <div className="space-y-4 text-left">
            {faqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isExpanded 
                      ? "border-orange-500 bg-orange-950/10 shadow-none" 
                      : "border-slate-800 bg-slate-900 hover:bg-slate-850"
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full flex justify-between items-center p-5 font-bold text-slate-200 text-base sm:text-[17px] focus:outline-none text-left cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className={`w-5 h-5 shrink-0 ${isExpanded ? "text-orange-500" : "text-slate-500"}`} />
                      {faq.question}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-orange-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-slate-300 text-sm sm:text-base font-medium leading-relaxed border-t border-orange-950/40 animate-slide-down">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800">
            <p className="text-slate-400 font-medium">No FAQ records are currently loaded in the database.</p>
          </div>
        )}

        {/* Floating Call to Action */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Circular light gradient */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500 rounded-full blur-[64px] opacity-10 pointer-events-none" />
          
          <div className="space-y-1 z-10">
            <h3 className="text-lg font-black text-slate-100">Still have questions?</h3>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              We are online on WhatsApp. Get in touch directly with the campus housing support team.
            </p>
          </div>

          <button
            onClick={handleWhatsAppContact}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-700/10 cursor-pointer transition-all z-10 shrink-0"
          >
            <MessageCircle className="w-4.5 h-4.5 fill-current" />
            Chat with Support
          </button>
        </div>

      </div>
    </section>
  );
}
