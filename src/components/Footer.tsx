import React from "react";
import { MessageCircle, Mail, Globe, MapPin, Sparkles, Twitter, Instagram, Facebook } from "lucide-react";

interface FooterProps {
  onNavigate: (view: string) => void;
  whatsappNumber?: string;
  contactEmail?: string;
  aboutText?: string;
}

export default function Footer({
  onNavigate,
  whatsappNumber = "+254142606140",
  contactEmail = "unistay.support@gmail.com",
  aboutText = "UNISTAY is Kenya's leading dedicated student accommodation finder. We eliminate the middleman and physical stress by providing a curated, verified directory of rooms, bedsitters, and shared apartments near primary higher-learning institutions.",
}: FooterProps) {

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent("Hello UNISTAY, I'd like more information.");
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  };

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 text-left pb-12 border-b border-slate-800">
          
          {/* About UNISTAY column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-slate-950 font-extrabold text-base shadow-sm">
                U
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                UNI<span className="text-orange-500">STAY</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              {aboutText}
            </p>
            
            {/* Socials */}
            <div className="flex gap-3 pt-2">
              <a href="https://tiktok.com/@unistay76" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center" title="TikTok">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.4-.43-.58-.66v6.56c.01 2-.51 4.07-1.76 5.61-1.38 1.72-3.65 2.68-5.83 2.53-2.4-.1-4.73-1.42-5.83-3.56-1.2-2.28-.96-5.26.7-7.23 1.34-1.63 3.6-2.49 5.71-2.2v4.06c-1.25-.12-2.58.33-3.26 1.39-.77 1.11-.64 2.74.37 3.65 1 .9 2.56.97 3.52.12.52-.44.75-1.12.75-1.79V.02z" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <button 
                  onClick={() => onNavigate("home")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Home Landing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("listings")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Available Rooms
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("reviews")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Student Reviews
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("faqs")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Frequently Asked FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Support Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Get In Touch
            </h4>
            <ul className="space-y-3.5 text-sm font-semibold text-slate-400">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Nairobi, Kenya (Serving major universities)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <button
                  onClick={handleWhatsAppClick}
                  className="hover:text-white transition-colors cursor-pointer text-left font-bold text-emerald-400"
                >
                  {whatsappNumber} (Direct WhatsApp Chat)
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} UNISTAY Accommodation. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
