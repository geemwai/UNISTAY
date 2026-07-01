import React, { useState, useMemo } from "react";
import { 
  Building2, Users, MessageSquare, HelpCircle, Settings as SettingsIcon, BarChart3, 
  Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, Upload, Sparkles, LogOut, Check, X
} from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { Listing, Review, FAQ, WebSettings, RoomType, AvailabilityStatus, UserProfile } from "../types";

interface AdminDashboardProps {
  listings: Listing[];
  reviews: Review[];
  faqs: FAQ[];
  users: UserProfile[];
  webSettings: WebSettings;
  onAddListing: (listing: Omit<Listing, "id">) => Promise<boolean>;
  onEditListing: (id: string, listing: Partial<Listing>) => Promise<boolean>;
  onDeleteListing: (id: string) => Promise<boolean>;
  onApproveReview: (id: string, approved: boolean) => Promise<boolean>;
  onDeleteReview: (id: string) => Promise<boolean>;
  onSaveSettings: (settings: WebSettings) => Promise<boolean>;
  onAddFaq: (faq: Omit<FAQ, "id">) => Promise<boolean>;
  onEditFaq: (id: string, faq: Partial<FAQ>) => Promise<boolean>;
  onDeleteFaq: (id: string) => Promise<boolean>;
  onRefreshData: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function AdminDashboard({
  listings,
  reviews,
  faqs,
  users,
  webSettings,
  onAddListing,
  onEditListing,
  onDeleteListing,
  onApproveReview,
  onDeleteReview,
  onSaveSettings,
  onAddFaq,
  onEditFaq,
  onDeleteFaq,
  onRefreshData,
  showToast,
}: AdminDashboardProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"stats" | "listings" | "users" | "reviews" | "faqs" | "settings">("stats");

  // Listing Form States
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState("");
  const [formRoomType, setFormRoomType] = useState<RoomType>("Bedsitter");
  const [formRent, setFormRent] = useState<number>(7500);
  const [formLocation, setFormLocation] = useState("");
  const [formUniversity, setFormUniversity] = useState("");
  const [formDistance, setFormDistance] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAmenities, setFormAmenities] = useState<string>("");
  const [formStatus, setFormStatus] = useState<AvailabilityStatus>("Available");
  const [formBedrooms, setFormBedrooms] = useState<number>(1);
  const [formBathrooms, setFormBathrooms] = useState<number>(1);
  const [formHouseRules, setFormHouseRules] = useState("");
  const [formGoogleMaps, setFormGoogleMaps] = useState("");
  
  // Local temporary store for uploaded image URLs
  const [formImages, setFormImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // FAQ Form States
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqOrder, setFaqOrder] = useState(1);

  // Settings form states
  const [setWhatsapp, setSetWhatsapp] = useState(webSettings?.whatsappNumber || "+254712345678");
  const [setSupportEmail, setSetSupportEmail] = useState(webSettings?.contactEmail || "support@unistay.com");
  const [setAboutText, setSetAboutText] = useState(webSettings?.aboutText || "");

  // Stats summaries
  const computedStats = useMemo(() => {
    const totalListingsCount = listings.length;
    const availableCount = listings.filter(l => l.availabilityStatus === "Available").length;
    const totalStudentsRegistered = users.filter(u => u.role === "student").length;
    const pendingReviewsCount = reviews.filter(r => !r.approved).length;
    
    // Average monthly rent
    const avgRent = totalListingsCount > 0 
      ? Math.round(listings.reduce((sum, current) => sum + current.monthlyRent, 0) / totalListingsCount)
      : 0;

    return {
      totalListingsCount,
      availableCount,
      totalStudentsRegistered,
      pendingReviewsCount,
      avgRent
    };
  }, [listings, users, reviews]);

  // Image Upload helper using Firebase Storage client-side
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `listings/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(downloadUrl);
      }
      setFormImages(prev => [...prev, ...uploadedUrls]);
      showToast(`Successfully uploaded ${uploadedUrls.length} images!`, "success");
    } catch (err: any) {
      console.error("Storage upload error:", err);
      showToast(`Failed to upload to Storage: ${err.message}`, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeFormImage = (idx: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit Listing Form
  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formRent < 5000) {
      showToast("Rent amount must be at least KSh 5,000.", "error");
      return;
    }

    if (formImages.length === 0) {
      // Inject standard premium placeholder if none uploaded
      formImages.push("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80");
    }

    const amenitiesArray = formAmenities
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const payload: Omit<Listing, "id"> = {
      title: formTitle,
      roomType: formRoomType,
      monthlyRent: Number(formRent),
      location: formLocation,
      nearbyUniversity: formUniversity,
      distanceFromCampus: formDistance,
      description: formDescription,
      amenities: amenitiesArray,
      availabilityStatus: formStatus,
      bedrooms: Number(formBedrooms),
      bathrooms: Number(formBathrooms),
      images: formImages,
      houseRules: formHouseRules,
      googleMapsUrl: formGoogleMaps,
      datePosted: new Date().toISOString()
    };

    let success = false;
    if (editingListingId) {
      success = await onEditListing(editingListingId, payload);
    } else {
      success = await onAddListing(payload);
    }

    if (success) {
      showToast(editingListingId ? "Listing updated successfully!" : "Listing added successfully!", "success");
      resetListingForm();
      onRefreshData();
    } else {
      showToast("Failed to save listing details.", "error");
    }
  };

  const resetListingForm = () => {
    setShowListingForm(false);
    setEditingListingId(null);
    setFormTitle("");
    setFormRoomType("Bedsitter");
    setFormRent(7500);
    setFormLocation("");
    setFormUniversity("");
    setFormDistance("");
    setFormDescription("");
    setFormAmenities("");
    setFormStatus("Available");
    setFormBedrooms(1);
    setFormBathrooms(1);
    setFormHouseRules("");
    setFormGoogleMaps("");
    setFormImages([]);
  };

  const handleEditListingClick = (item: Listing) => {
    setEditingListingId(item.id);
    setFormTitle(item.title);
    setFormRoomType(item.roomType);
    setFormRent(item.monthlyRent);
    setFormLocation(item.location);
    setFormUniversity(item.nearbyUniversity);
    setFormDistance(item.distanceFromCampus);
    setFormDescription(item.description);
    setFormAmenities(item.amenities?.join(", ") || "");
    setFormStatus(item.availabilityStatus);
    setFormBedrooms(item.bedrooms);
    setFormBathrooms(item.bathrooms);
    setFormHouseRules(item.houseRules || "");
    setFormGoogleMaps(item.googleMapsUrl || "");
    setFormImages(item.images || []);
    setShowListingForm(true);
  };

  const handleDeleteListingClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this room listing?")) return;
    const success = await onDeleteListing(id);
    if (success) {
      showToast("Listing deleted successfully!", "success");
      onRefreshData();
    } else {
      showToast("Failed to delete listing.", "error");
    }
  };

  // Review Moderate actions
  const handleReviewApproval = async (id: string, approved: boolean) => {
    const success = await onApproveReview(id, approved);
    if (success) {
      showToast(approved ? "Review approved publicly!" : "Review unapproved successfully", "success");
      onRefreshData();
    } else {
      showToast("Action failed.", "error");
    }
  };

  const handleReviewDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    const success = await onDeleteReview(id);
    if (success) {
      showToast("Review removed.", "success");
      onRefreshData();
    } else {
      showToast("Action failed.", "error");
    }
  };

  // Settings save
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSaveSettings({
      whatsappNumber: setWhatsapp,
      contactEmail: setSupportEmail,
      aboutText: setAboutText
    });
    if (success) {
      showToast("Web support settings updated successfully!", "success");
      onRefreshData();
    } else {
      showToast("Failed to update settings.", "error");
    }
  };

  // FAQ Submit
  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<FAQ, "id"> = {
      question: faqQuestion,
      answer: faqAnswer,
      order: Number(faqOrder)
    };

    let success = false;
    if (editingFaqId) {
      success = await onEditFaq(editingFaqId, payload);
    } else {
      success = await onAddFaq(payload);
    }

    if (success) {
      showToast(editingFaqId ? "FAQ updated!" : "FAQ created successfully!", "success");
      resetFaqForm();
      onRefreshData();
    } else {
      showToast("Failed to save FAQ record.", "error");
    }
  };

  const resetFaqForm = () => {
    setShowFaqForm(false);
    setEditingFaqId(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqOrder(faqs.length + 1);
  };

  const handleEditFaqClick = (faq: FAQ) => {
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqOrder(faq.order);
    setShowFaqForm(true);
  };

  const handleDeleteFaqClick = async (id: string) => {
    if (!window.confirm("Delete this FAQ?")) return;
    const success = await onDeleteFaq(id);
    if (success) {
      showToast("FAQ deleted.", "success");
      onRefreshData();
    } else {
      showToast("Failed to delete FAQ.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-left">
      
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-extrabold">
            A
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">UNISTAY Admin</h2>
            <p className="text-[10px] text-orange-400 font-bold flex items-center gap-1 mt-0.5">
              ● Secure Controller
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 font-bold text-sm">
          <button
            onClick={() => setActiveTab("stats")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === "stats" ? "bg-orange-500 text-slate-950" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4.5 h-4.5" /> Dashboard Stats
          </button>
          
          <button
            onClick={() => setActiveTab("listings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === "listings" ? "bg-orange-500 text-slate-950" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4.5 h-4.5" /> Manage Listings
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === "users" ? "bg-orange-500 text-slate-950" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4.5 h-4.5" /> Registered Users
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative cursor-pointer ${
              activeTab === "reviews" ? "bg-orange-500 text-slate-950" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" /> Reviews Approval
            {computedStats.pendingReviewsCount > 0 && (
              <span className="absolute right-3 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {computedStats.pendingReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("faqs")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === "faqs" ? "bg-orange-500 text-slate-950" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-4.5 h-4.5" /> Manage FAQs
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === "settings" ? "bg-orange-500 text-slate-950" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <SettingsIcon className="w-4.5 h-4.5" /> Global Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onRefreshData}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Force Sync DB
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-950">
        
        {/* STATS VIEW */}
        {activeTab === "stats" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-100">Dashboard Overviews</h1>
                <p className="text-slate-400 text-sm font-semibold">Real-time statistics sourced securely from Cloud Firestore.</p>
              </div>
              <button 
                onClick={onRefreshData}
                className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm"
                title="Sync database values"
              >
                <RefreshCw className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 inline-block">
                  <Building2 className="w-6 h-6" />
                </span>
                <span className="block text-3xl font-black text-slate-900 mt-4">{computedStats.totalListingsCount}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Total Listed Rooms</span>
              </div>

              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 inline-block">
                  <CheckCircle2 className="w-6 h-6" />
                </span>
                <span className="block text-3xl font-black text-slate-900 mt-4">{computedStats.availableCount}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Units Available</span>
              </div>

              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <span className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 inline-block">
                  <Users className="w-6 h-6" />
                </span>
                <span className="block text-3xl font-black text-slate-900 mt-4">{computedStats.totalStudentsRegistered}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Registered Students</span>
              </div>

              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <span className="p-2.5 rounded-2xl bg-yellow-50 text-yellow-600 inline-block">
                  <MessageSquare className="w-6 h-6" />
                </span>
                <span className="block text-3xl font-black text-slate-900 mt-4">{reviews.length}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">Total Reviews</span>
              </div>

            </div>

            {/* Middle widgets */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-100 p-6.5 rounded-3xl shadow-sm text-left space-y-4">
                <h3 className="font-black text-slate-900 text-lg">Platform Highlights</h3>
                <div className="space-y-3.5 text-sm font-semibold text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Average Room Rent</span>
                    <span>KSh {computedStats.avgRent.toLocaleString()} / mo</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Total Approved Reviews</span>
                    <span>{reviews.filter(r => r.approved).length} approved</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Contact WhatsApp Number</span>
                    <span className="text-emerald-600">{webSettings.whatsappNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Active FAQs Records</span>
                    <span>{faqs.length} FAQs</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-6.5 rounded-3xl shadow-sm flex flex-col justify-center text-center space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                <Sparkles className="w-8 h-8 text-indigo-500 mx-auto" />
                <h3 className="font-black text-slate-900 text-lg">Welcome to UNISTAY Portal</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Only administrators have secure access rights to publish properties, update tenant settings, and approve reviews. Verify details diligently to guarantee high-quality listings!
                </p>
              </div>
            </div>

          </div>
        )}

        {/* MANAGE LISTINGS VIEW */}
        {activeTab === "listings" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Manage Room Listings</h1>
                <p className="text-slate-500 text-sm font-semibold">Publish new properties, update pricing, or edit availability status.</p>
              </div>
              {!showListingForm && (
                <button
                  onClick={() => {
                    resetListingForm();
                    setShowListingForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Listing
                </button>
              )}
            </div>

            {/* Listing Form */}
            {showListingForm && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 animate-fade-in text-left space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">
                    {editingListingId ? "Edit Accomodation Details" : "Publish New Accomodation"}
                  </h3>
                  <button onClick={resetListingForm} className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider">
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleListingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Listing Title</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Cozy Executive Bedsitter near JKUAT Gachororo"
                      className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* Room Type */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Room Type</label>
                    <select
                      value={formRoomType}
                      onChange={(e) => setFormRoomType(e.target.value as RoomType)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
                    >
                      <option value="Shared Room">Shared Room</option>
                      <option value="Bedsitter">Bedsitter</option>
                      <option value="One Bedroom">One Bedroom</option>
                    </select>
                  </div>

                  {/* Rent */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Rent (KSh, min 5000)</label>
                    <input
                      type="number"
                      required
                      min="5000"
                      value={formRent}
                      onChange={(e) => setFormRent(Number(e.target.value))}
                      placeholder="7500"
                      className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 font-mono"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Location Zone</label>
                    <input
                      type="text"
                      required
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="Juja, Gachororo Road"
                      className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* University */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nearby University / College</label>
                    <input
                      type="text"
                      required
                      value={formUniversity}
                      onChange={(e) => setFormUniversity(e.target.value)}
                      placeholder="JKUAT Campus"
                      className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* Distance */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Distance from Campus Gate</label>
                    <input
                      type="text"
                      required
                      value={formDistance}
                      onChange={(e) => setFormDistance(e.target.value)}
                      placeholder="5 min walk (400m)"
                      className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Availability Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as AvailabilityStatus)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Bedrooms</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formBedrooms}
                      onChange={(e) => setFormBedrooms(Number(e.target.value))}
                      placeholder="1"
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Bathrooms</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formBathrooms}
                      onChange={(e) => setFormBathrooms(Number(e.target.value))}
                      placeholder="1"
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* Amenities */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Amenities (comma separated)</label>
                    <input
                      type="text"
                      value={formAmenities}
                      onChange={(e) => setFormAmenities(e.target.value)}
                      placeholder="High-speed Wi-Fi, Hot Shower, CCTV Security, Balcony"
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Detailed Description</label>
                    <textarea
                      required
                      rows={4}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Provide full description of utilities, common areas, water availability, token system..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold text-slate-800 resize-none"
                    />
                  </div>

                  {/* House Rules */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">House Rules / Policies</label>
                    <textarea
                      rows={3}
                      value={formHouseRules}
                      onChange={(e) => setFormHouseRules(e.target.value)}
                      placeholder="No loud music after 10 PM. No pets. Garbage must be disposed on weekends."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 resize-none"
                    />
                  </div>

                  {/* Google Maps search string or link */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Google Maps Link (Optional)</label>
                    <input
                      type="text"
                      value={formGoogleMaps}
                      onChange={(e) => setFormGoogleMaps(e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* Firebase Storage Image Upload Widget */}
                  <div className="md:col-span-2 space-y-3 bg-slate-50 p-6 border border-slate-200 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-indigo-600" />
                          Upload Images to Firebase Storage
                        </h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          Select one or more room image files. They will upload instantly to Storage bucket.
                        </p>
                      </div>
                      
                      <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow">
                        {uploadingImage ? "Uploading..." : "Select Files"}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Previews */}
                    {formImages.length > 0 && (
                      <div className="flex flex-wrap gap-3.5 pt-3">
                        {formImages.map((img, idx) => (
                          <div key={idx} className="relative w-20 h-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeFormImage(idx)}
                              className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetListingForm}
                      className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider shadow cursor-pointer transition-colors"
                    >
                      {editingListingId ? "Save Changes" : "Publish Listing"}
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* Listings Directory List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-base">Current Listed Accommodations ({listings.length})</h3>
              </div>

              {listings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {listings.map((item) => (
                    <div key={item.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4 truncate">
                        <img 
                          src={item.images?.[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=100&q=80"} 
                          className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                        />
                        <div className="truncate">
                          <h4 className="font-extrabold text-slate-800 text-[15px] truncate">{item.title}</h4>
                          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                            {item.roomType} • KSh {item.monthlyRent.toLocaleString()}/mo • <span className={item.availabilityStatus === "Available" ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{item.availabilityStatus}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleEditListingClick(item)}
                          className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-550 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteListingClick(item.id)}
                          className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <p className="font-semibold">No rooms are currently registered. Add one above!</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* USERS VIEW */}
        {activeTab === "users" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Registered Student Directory</h1>
              <p className="text-slate-500 text-sm font-semibold">Browse fully authenticated students currently accessing UNISTAY listings.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-base">User Directory ({users.length})</h3>
              </div>

              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <th className="p-4 pl-6">Student Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Assigned Role</th>
                        <th className="p-4 pr-6">Created On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                      {users.map((u) => (
                        <tr key={u.uid} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-4 pl-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                              {u.name?.charAt(0) || "S"}
                            </div>
                            <span className="font-extrabold text-slate-800">{u.name}</span>
                          </td>
                          <td className="p-4 text-slate-500">{u.email}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded ${
                              u.role === "admin" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 pr-6">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Prior"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <p>No registered user data synchronized.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS VIEW (MODERATOR) */}
        {activeTab === "reviews" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Approve Student Reviews</h1>
              <p className="text-slate-500 text-sm font-semibold">Moderator panel: Approve, suspend, or delete student experience comments.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-base">Reviews Index ({reviews.length})</h3>
              </div>

              {reviews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-800">{r.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                              r.approved 
                                ? "bg-emerald-50 border border-emerald-100 text-emerald-700" 
                                : "bg-amber-50 border border-amber-100 text-amber-700 animate-pulse"
                            }`}>
                              {r.approved ? "Approved" : "Pending approval"}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-semibold">{new Date(r.date).toLocaleString()}</span>
                        </div>
                        
                        <div className="flex gap-2 shrink-0">
                          {r.approved ? (
                            <button
                              onClick={() => handleReviewApproval(r.id, false)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Hide
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReviewApproval(r.id, true)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow cursor-pointer"
                            >
                              Approve Publicly
                            </button>
                          )}
                          <button
                            onClick={() => handleReviewDelete(r.id)}
                            className="p-1.5 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm font-semibold max-w-3xl leading-relaxed italic bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                        "{r.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <p>No reviews have been submitted yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQS VIEW */}
        {activeTab === "faqs" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Manage Help FAQs</h1>
                <p className="text-slate-500 text-sm font-semibold">Maintain self-help instructions and questions displayed on student landing pages.</p>
              </div>
              {!showFaqForm && (
                <button
                  onClick={() => {
                    resetFaqForm();
                    setShowFaqForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow cursor-pointer transition-colors"
                >
                  <Plus className="w-4.5 h-4.5" /> Add FAQ
                </button>
              )}
            </div>

            {showFaqForm && (
              <form onSubmit={handleFaqSubmit} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm text-left space-y-4 animate-fade-in">
                <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100">
                  {editingFaqId ? "Edit FAQ Details" : "Create New FAQ"}
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">FAQ Question</label>
                  <input
                    type="text"
                    required
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    placeholder="Is there a booking fee?"
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">FAQ Answer</label>
                  <textarea
                    required
                    rows={4}
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    placeholder="Absolutely not. UNISTAY is 100% free for all students..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 resize-none"
                  />
                </div>

                <div className="space-y-1.5 w-32">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Sort Order</label>
                  <input
                    type="number"
                    required
                    value={faqOrder}
                    onChange={(e) => setFaqOrder(Number(e.target.value))}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={resetFaqForm} className="px-4 py-2 text-slate-500 font-bold text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow hover:bg-indigo-500 cursor-pointer transition-colors">
                    Save FAQ
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-base">Help Desk FAQs ({faqs.length})</h3>
              </div>

              {faqs.length > 0 ? (
                <div className="divide-y divide-slate-100 text-sm font-medium">
                  {faqs.map((f) => (
                    <div key={f.id} className="p-5 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800">
                          <span className="text-slate-400 font-mono mr-1.5">#{f.order}</span>
                          {f.question}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium max-w-2xl">{f.answer}</p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleEditFaqClick(f)}
                          className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaqClick(f.id)}
                          className="p-2 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <p>No FAQs currently available.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeTab === "settings" && (
          <div className="space-y-8 max-w-2xl text-left">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Web Support Configurations</h1>
              <p className="text-slate-500 text-sm font-semibold">Update contact numbers, email channels, and introductory metadata about UNISTAY.</p>
            </div>

            <form onSubmit={handleSaveSettingsSubmit} className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Floating Support WhatsApp Number</label>
                <input
                  type="text"
                  required
                  value={setWhatsapp}
                  onChange={(e) => setSetWhatsapp(e.target.value)}
                  placeholder="+254712345678"
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 font-mono"
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Must include country code, e.g. +254 for Kenya, without spacing.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Support Email Address</label>
                <input
                  type="email"
                  required
                  value={setSupportEmail}
                  onChange={(e) => setSetSupportEmail(e.target.value)}
                  placeholder="support@gmail.com"
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">About Platform Copy (Footer / Bio)</label>
                <textarea
                  required
                  rows={5}
                  value={setAboutText}
                  onChange={(e) => setSetAboutText(e.target.value)}
                  placeholder="About the UNISTAY housing portal..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider shadow cursor-pointer transition-colors"
              >
                Save support configurations
              </button>

            </form>
          </div>
        )}

      </main>

    </div>
  );
}
