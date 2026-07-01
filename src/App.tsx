import React, { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { MessageCircle, Shield, Loader2 } from "lucide-react";
import { auth, googleProvider } from "./firebase";
import { Listing, Review, FAQ, WebSettings, UserProfile } from "./types";

// Component Imports
import Header from "./components/Header";
import Hero from "./components/Hero";
import ListingsSection from "./components/ListingsSection";
import RoomDetailsModal from "./components/RoomDetailsModal";
import ReviewSection from "./components/ReviewSection";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import AdminDashboard from "./components/AdminDashboard";
import Toast, { ToastMessage } from "./components/Toast";

export default function App() {
  // Navigation
  const [currentView, setCurrentView] = useState<string>("home");
  const [activeDetailsListing, setActiveDetailsListing] = useState<Listing | null>(null);

  // Authentication & Profile States
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Database lists
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [webSettings, setWebSettings] = useState<WebSettings>({
    whatsappNumber: "+254142606140",
    contactEmail: "unistay.support@gmail.com",
    aboutText: "UNISTAY is one of Kenya's dedicated student accommodation finder developed by students for students. We eliminate the middleman and physical stress by providing a curated, verified directory of rooms, bedsitters, and shared apartments near primary higher-learning institutions."
  });

  // UI States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [appLoading, setAppLoading] = useState(true);

  // Notification Toast Helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    const newToast: ToastMessage = {
      id: Date.now() + Math.random(),
      text,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ----------------------------------------------------
  // DATA FETCHING ROUTINES (REST API Client)
  // ----------------------------------------------------
  const fetchListings = async () => {
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faqs");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (err) {
      console.error("Error fetching faqs:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setWebSettings(data);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  // Fetched only if active user is administrator
  const fetchUsers = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();
      const res = await fetch("/api/users", {
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching user directory:", err);
    }
  };

  const refreshAllData = () => {
    fetchListings();
    fetchReviews();
    fetchFaqs();
    fetchSettings();
    if (userProfile?.role === "admin") {
      fetchUsers();
    }
  };

  // ----------------------------------------------------
  // AUTHENTICATION LISTENER
  // ----------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAppLoading(true);
      if (firebaseUser) {
        try {
          // 1. Sync / register profile in Firestore database via secure POST
          const registerRes = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Student User",
            }),
          });

          if (registerRes.ok) {
            const syncResult = await registerRes.json();
            setUserProfile(syncResult.profile);
            
            // Welcome feedback
            showToast(`Signed in successfully! Welcome, ${syncResult.profile.name}.`, "success");

            // If user is administrator, sync admin user lists automatically
            if (syncResult.profile.role === "admin") {
              // Fetch users
              const idToken = await firebaseUser.getIdToken();
              const usersRes = await fetch("/api/users", {
                headers: { "Authorization": `Bearer ${idToken}` }
              });
              if (usersRes.ok) {
                const usersList = await usersRes.json();
                setUsers(usersList);
              }
            }
          }
        } catch (error) {
          console.error("Error syncing authenticated user profile:", error);
          showToast("Signed in, but profile synchronization failed.", "error");
        }
      } else {
        setUserProfile(null);
        setUsers([]);
      }
      setAppLoading(false);
    });

    // Boot initial data feeds
    refreshAllData();

    return () => unsubscribe();
  }, []);

  // Sync users list whenever user role promotes to admin during the session
  useEffect(() => {
    if (userProfile?.role === "admin" && users.length === 0) {
      fetchUsers();
    }
  }, [userProfile]);

  // ----------------------------------------------------
  // FIREBASE CLIENT AUTH ACTIONS
  // ----------------------------------------------------
  const handleClientLogin = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (err: any) {
      console.error("Login failed:", err);
      return { success: false, error: err.message };
    }
  };

  const handleClientRegister = async (email: string, pass: string, name: string) => {
    try {
      // 1. Create credential
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      
      // 2. Profile Sync occurs automatically inside the onAuthStateChanged listener!
      // But we can store the display name beforehand so it grabs the name properly
      return { success: true };
    } catch (err: any) {
      console.error("Registration failed:", err);
      return { success: false, error: err.message };
    }
  };

  const handleClientGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err: any) {
      console.error("Google authentication failed:", err);
      return { success: false, error: err.message };
    }
  };

  const handleClientLogout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setCurrentView("home");
      showToast("Signed out successfully. See you again soon!", "success");
    } catch (err) {
      showToast("Sign out encountered an error.", "error");
    }
  };

  // ----------------------------------------------------
  // ADMIN CONTROL PANEL MUTATIONAL ACTIONS (WITH JWT)
  // ----------------------------------------------------
  const handleAddListing = async (listing: Omit<Listing, "id">) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      const idToken = await user.getIdToken();

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(listing)
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleEditListing = async (id: string, listing: Partial<Listing>) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      const idToken = await user.getIdToken();

      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(listing)
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      const idToken = await user.getIdToken();

      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Student reviews posting
  const handleAddReview = async (name: string, rating: number, comment: string) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });
      if (res.ok) {
        fetchReviews(); // Reload list
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Review approval/moderation
  const handleApproveReview = async (id: string, approved: boolean) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      const idToken = await user.getIdToken();

      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ approved })
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      const idToken = await user.getIdToken();

      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Web Settings
  const handleSaveSettings = async (settings: WebSettings) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      const idToken = await user.getIdToken();

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(settings)
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // FAQ Mutational Actions
  const handleAddFaq = async (faq: Omit<FAQ, "id">) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      const idToken = await user.getIdToken();

      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(faq)
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleEditFaq = async (id: string, faq: Partial<FAQ>) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      const idToken = await user.getIdToken();

      const res = await fetch(`/api/faqs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(faq)
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      const idToken = await user.getIdToken();

      const res = await fetch(`/api/faqs/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // ----------------------------------------------------
  // GENERAL CLICKS
  // ----------------------------------------------------
  const handleOpenAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleViewListingDetails = (listing: Listing) => {
    if (!userProfile) {
      // Force sign-in first
      showToast("Please sign in or register to unlock complete room details, rules, maps, and WhatsApp contacts.", "error");
      handleOpenAuthModal("login");
    } else {
      setActiveDetailsListing(listing);
    }
  };

  const handleFloatingWhatsApp = () => {
    const predefinedMsg = "Hello, I found this room on UNISTAY and I'm interested in getting more information.";
    const whatsappUrl = `https://wa.me/${webSettings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(predefinedMsg)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-950 text-slate-100 antialiased selection:bg-orange-500 selection:text-slate-950">
      
      {/* Dynamic Loader Backdrop */}
      {appLoading && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-sm font-bold text-slate-300 tracking-wide">Syncing housing directory...</p>
        </div>
      )}

      {/* Header element rendered on all pages except the Admin Panel itself to maximize administration working space */}
      {currentView !== "admin" && (
        <Header
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            // Scroll to top
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          userProfile={userProfile}
          onLogout={handleClientLogout}
          onOpenAuth={handleOpenAuthModal}
        />
      )}

      {/* VIEW ENGINE DISPATCHER */}
      <main className="flex-1">
        {currentView === "home" && (
          <div className="animate-fade-in space-y-0">
            <Hero
              onSearchClick={() => {
                setCurrentView("listings");
                setTimeout(() => {
                  const el = document.getElementById("available-rooms");
                  el?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              onOpenAuth={handleOpenAuthModal}
              isLoggedIn={!!userProfile}
            />
            <ListingsSection
             listings={filteredListings}
             onViewDetails={handleViewListingDetails}
             isLoggedIn={!!userProfile}
             onOpenAuth={() => handleOpenAuthModal("login")}
             isAdmin={userProfile?.role === "admin"} 
           /> 
            <FaqSection faqs={faqs} whatsappNumber={webSettings.whatsappNumber} />
          </div>
        )}

        {currentView === "listings" && (
          <div className="animate-fade-in">
            <ListingsSection
              listings={listings}
              onViewDetails={handleViewListingDetails}
              isLoggedIn={!!userProfile}
              onOpenAuth={() => handleOpenAuthModal("login")}
            />
          </div>
        )}

        {currentView === "reviews" && (
          <div className="animate-fade-in">
            <ReviewSection
              reviews={reviews}
              onAddReview={handleAddReview}
              isLoggedIn={!!userProfile}
              onOpenAuth={() => handleOpenAuthModal("login")}
            />
          </div>
        )}

        {currentView === "faqs" && (
          <div className="animate-fade-in">
            <FaqSection faqs={faqs} whatsappNumber={webSettings.whatsappNumber} />
          </div>
        )}

        {currentView === "admin" && (
          <div className="animate-fade-in">
            {/* Hard Security Guard: Redundant fallback if role sync is delayed */}
            {userProfile?.role === "admin" ? (
              <div className="relative">
                {/* Back button to main student portal */}
                <button
                  onClick={() => {
                    setCurrentView("home");
                    window.scrollTo({ top: 0 });
                  }}
                  className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs tracking-wider uppercase border border-slate-700 shadow-xl cursor-pointer transition-all"
                >
                  ← Exit Admin Panel
                </button>
                <AdminDashboard
                  listings={listings}
                  reviews={reviews}
                  faqs={faqs}
                  users={users}
                  webSettings={webSettings}
                  onAddListing={handleAddListing}
                  onEditListing={handleEditListing}
                  onDeleteListing={handleDeleteListing}
                  onApproveReview={handleApproveReview}
                  onDeleteReview={handleDeleteReview}
                  onSaveSettings={handleSaveSettings}
                  onAddFaq={handleAddFaq}
                  onEditFaq={handleEditFaq}
                  onDeleteFaq={handleDeleteFaq}
                  onRefreshData={refreshAllData}
                  showToast={showToast}
                />
              </div>
            ) : (
              <div className="py-24 text-center max-w-md mx-auto space-y-4 px-4">
                <div className="w-16 h-16 bg-red-950/40 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black text-slate-100">Access Denied</h1>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">
                  You are currently logged in as a student or guest. Student profiles do not have administrative access privileges to access dashboard logs.
                </p>
                <button
                  onClick={() => {
                    setCurrentView("home");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Return to Homepage
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      {currentView !== "admin" && (
        <Footer
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          whatsappNumber={webSettings.whatsappNumber}
          contactEmail={webSettings.contactEmail}
          aboutText={webSettings.aboutText}
        />
      )}

      {/* FLOATING WHATSAPP BUTTON (ON EVERY VIEW) */}
      <button
        onClick={handleFloatingWhatsApp}
        className="fixed bottom-6 right-6 z-40 p-4.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl hover:shadow-emerald-300 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-bounce-slow"
        title="Direct Chat on WhatsApp"
      >
        <MessageCircle className="w-6.5 h-6.5 fill-current" />
      </button>

      {/* DETAIL MODAL DRAWER */}
      {activeDetailsListing && (
        <RoomDetailsModal
          listing={activeDetailsListing}
          onClose={() => setActiveDetailsListing(null)}
          whatsappNumber={webSettings.whatsappNumber}
          isAdmin={userProfile?.role === "admin"} 
        />
      )}

      {/* AUTH MODAL DRAWER */}
      {authModalOpen && (
        <AuthModal
          initialTab={authModalTab}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleClientLogin}
          onRegister={handleClientRegister}
          onGoogleLogin={handleClientGoogleLogin}
        />
      )}

      {/* REAL-TIME TOAST NOTIFICATIONS DRAWER */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

    </div>
  );
}
