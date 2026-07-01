import React, { useState } from "react";
import { X, Mail, Lock, User, AlertCircle, Sparkles, LogIn, ChevronRight, Check, Shield } from "lucide-react";

interface AuthModalProps {
  initialTab: "login" | "register";
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin: () => Promise<{ success: boolean; error?: string }>;
}

export default function AuthModal({
  initialTab,
  onClose,
  onLogin,
  onRegister,
  onGoogleLogin,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validation
    if (activeTab === "register") {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please check and try again.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Weak password: Password must be at least 6 characters.");
        return;
      }

      setLoading(true);
      const res = await onRegister(email, password, fullName);
      setLoading(false);
      
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(translateFirebaseError(res.error));
      }
    } else {
      setLoading(true);
      const res = await onLogin(email, password);
      setLoading(false);

      if (res.success) {
        onClose();
      } else {
        setErrorMessage(translateFirebaseError(res.error));
      }
    }
  };

  const handleGoogleClick = async () => {
    setErrorMessage(null);
    setLoading(true);
    const res = await onGoogleLogin();
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(translateFirebaseError(res.error));
    }
  };

  // Human-friendly Firebase error translation
  const translateFirebaseError = (errString?: string) => {
    if (!errString) return "Authentication failed. Please verify your credentials.";
    const lower = errString.toLowerCase();
    
    if (lower.includes("popup-closed-by-user") || lower.includes("popup-blocked")) {
      return "Google Sign-In popup was closed or blocked. Browser security in iframe previews may restrict popups. Please retry Google Sign-In or use Email/Password!";
    }
    if (lower.includes("wrong-password") || lower.includes("invalid-credential")) {
      return "Incorrect password or email. Please check your credentials and try again.";
    }
    if (lower.includes("user-not-found")) {
      return "Invalid email: No user profile associated with this email address.";
    }
    if (lower.includes("email-already-in-use")) {
      return "Existing email: This email address is already registered on UNISTAY.";
    }
    if (lower.includes("invalid-email")) {
      return "Invalid email: Please enter a valid, structured email address.";
    }
    if (lower.includes("weak-password")) {
      return "Weak password: Password must be at least 6 characters long.";
    }
    
    return errString; // Fallback
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-800 p-8 animate-scale-up space-y-6">
        
        {/* Header close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-orange-500 hover:bg-slate-950 rounded-xl cursor-pointer transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand visual header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-none">
            U
          </div>
          <h3 className="text-2xl font-black text-slate-100">
            {activeTab === "login" ? "Welcome back!" : "Create your account"}
          </h3>
          <p className="text-slate-400 text-xs font-semibold">
            {activeTab === "login" 
              ? "Sign in to find verified student accommodation near you." 
              : "Register to unlock mapping coordinates, rules, and support chats."}
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-950 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "login" 
                ? "bg-slate-900 text-orange-400 shadow-none" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "register" 
                ? "bg-slate-900 text-orange-400 shadow-none" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Register
          </button>
        </div>

        {/* Social Authentication */}
        <div className="space-y-3.5">
          <button
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-200 text-sm font-bold flex items-center justify-center gap-3 cursor-pointer shadow-none transition-all"
          >
            {/* Google vector icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-3 text-slate-800">
          <span className="flex-1 h-[1px] bg-slate-800" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">or use email</span>
          <span className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* Main credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          /* Full Name for registration */}
          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-200 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="unistay.support@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-200 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-200 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Confirm Password */}
          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-200 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          {/* Errors section */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-2.5 text-xs font-semibold text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-none cursor-pointer transition-all pt-3.5 mt-2"
          >
            {loading ? "Please wait..." : activeTab === "login" ? "Sign In" : "Register Profile"}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>

        </form>
      </div>
    </div>
  );
}
