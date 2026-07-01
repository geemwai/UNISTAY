import React, { useState } from "react";
import { User, LogOut, ShieldCheck, Menu, X, Home } from "lucide-react";
import { UserProfile } from "../types";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: (tab: "login" | "register") => void;
}

export default function Header({
  currentView,
  onNavigate,
  userProfile,
  onLogout,
  onOpenAuth,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", view: "home" },
    { label: "Available Rooms", view: "listings" },
    { label: "About", view: "about" },
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-900 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform">
              U
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-100 group-hover:text-orange-500 transition-colors">
                UNI<span className="text-orange-500">STAY</span>
              </span>
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase -mt-1">
                Student Housing
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`text-[15px] font-semibold tracking-wide transition-colors relative py-1 cursor-pointer ${
                  currentView === item.view
                    ? "text-orange-500 font-bold"
                    : "text-slate-300 hover:text-orange-400"
                }`}
              >
                {item.label}
                {currentView === item.view && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500 rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-4">
            {userProfile ? (
              <div className="flex items-center gap-3">
                {userProfile.role === "admin" && (
                  <button
                    onClick={() => handleNavClick("admin")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-900/30 bg-emerald-950/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-950/40 cursor-pointer transition-all ${
                      currentView === "admin" ? "ring-2 ring-emerald-500 ring-offset-2" : ""
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </button>
                )}
                
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-bold uppercase">
                    {userProfile.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                    {userProfile.name}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth("login")}
                  className="px-4.5 py-2 text-[15px] font-medium text-slate-300 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth("register")}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-[15px] font-bold tracking-wide cursor-pointer transition-all"
                >
                  Find a Room
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            {userProfile && userProfile.role === "admin" && (
              <button
                onClick={() => onNavigate("admin")}
                className="p-1.5 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-lg"
                title="Admin Panel"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-orange-500 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-900 bg-slate-950 shadow-lg animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  currentView === item.view
                    ? "bg-orange-500/10 text-orange-500 font-bold"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4 border-t border-slate-900">
              {userProfile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold">
                      {userProfile.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{userProfile.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{userProfile.role}</p>
                    </div>
                  </div>
                  {userProfile.role === "admin" && (
                    <button
                      onClick={() => handleNavClick("admin")}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 text-emerald-400 font-semibold hover:bg-emerald-950/20 rounded-xl"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-400 font-semibold hover:bg-red-950/20 rounded-xl"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-2">
                  <button
                    onClick={() => {
                      onOpenAuth("login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-800 text-slate-300 font-semibold hover:bg-slate-900 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth("register");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2.5 rounded-xl bg-orange-500 text-slate-950 font-bold"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
