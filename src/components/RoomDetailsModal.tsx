import React, { useState } from "react";
import { X, MapPin, GraduationCap, CheckCircle, MessageCircle, ArrowLeft, Bed, Bath, AlertTriangle, ExternalLink } from "lucide-react";
import { Listing } from "../types";

interface RoomDetailsModalProps {
  listing: Listing;
  onClose: () => void;
  whatsappNumber?: string;
}

export default function RoomDetailsModal({
  listing,
  onClose,
  whatsappNumber = "+254142606140",
}: RoomDetailsModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"];

  const handleWhatsAppContact = () => {
    const defaultText = `Hello, I found this room ("${listing.title}") on UNISTAY and I'm interested in getting more information.`;
    const encodedText = encodeURIComponent(defaultText);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // Convert map url for embedding or use a standard search link
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    listing.title + " " + listing.location
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="relative bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden animate-scale-up max-h-[92vh] flex flex-col border border-slate-800">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded border border-orange-900/30">
              {listing.roomType}
            </span>
            <h2 className="text-xl font-black text-slate-100 truncate mt-2">
              {listing.title}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-slate-950 rounded-xl cursor-pointer transition-all"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1 space-y-8 bg-slate-900">
          
          {/* Main Gallery Section */}
          <div className="grid md:grid-cols-12 gap-6">
            
            {/* Active Image and Carousel */}
            <div className="md:col-span-8 flex flex-col gap-3">
              <div className="aspect-[16/10] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 relative">
                <img
                  src={images[activeImageIdx]}
                  alt={`${listing.title} gallery active`}
                  className="w-full h-full object-cover"
                />
                
                {/* Float Rent indicator */}
                <div className="absolute bottom-4 left-4 bg-slate-950/95 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl text-orange-400 font-black text-base shadow">
                  KSh {listing.monthlyRent.toLocaleString()}/mo
                </div>
              </div>

              {/* Thumbnails list */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative aspect-[4/3] w-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                        activeImageIdx === idx ? "border-orange-500 scale-95" : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick stats sidebar */}
            <div className="md:col-span-4 bg-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Property Stats</h3>
                
                <div className="space-y-3 text-sm font-semibold text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-medium">Monthly Rent</span>
                    <span className="text-orange-400 font-extrabold">KSh {listing.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-medium">Room Type</span>
                    <span className="text-slate-200 font-bold">{listing.roomType}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-medium">Proximity</span>
                    <span className="text-slate-200 font-bold">{listing.distanceFromCampus}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-medium">Status</span>
                    <span className={`font-black uppercase text-xs ${listing.availabilityStatus === "Available" ? "text-emerald-400" : "text-rose-500"}`}>
                      {listing.availabilityStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-2">
                    <Bed className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Bedrooms</p>
                      <p className="text-sm font-extrabold text-slate-200">{listing.bedrooms}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-2">
                    <Bath className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Bathrooms</p>
                      <p className="text-sm font-extrabold text-slate-200">{listing.bathrooms}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to action on sidebar */}
              <button
                onClick={handleWhatsAppContact}
                disabled={listing.availabilityStatus !== "Available"}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold text-[15px] shadow-none hover:shadow-lg hover:shadow-emerald-950/20 disabled:shadow-none transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                Contact on WhatsApp
              </button>
            </div>

          </div>

          {/* Description & Amenities details */}
          <div className="grid md:grid-cols-12 gap-8 pt-4 border-t border-slate-800">
            
            {/* Left Col - Full Details */}
            <div className="md:col-span-8 space-y-6 text-left">
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-100">About this Accommodation</h3>
                <p className="text-slate-300 text-[15px] font-medium leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Location info */}
              <div className="space-y-3 bg-slate-950 border border-slate-850 p-5 rounded-2xl">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" /> Location Details
                </h4>
                <div className="text-slate-300 text-sm font-semibold space-y-2 pt-1">
                  <p>📍 <strong className="text-slate-400">Primary Zone:</strong> {listing.location}</p>
                  <p>🎓 <strong className="text-slate-400">Nearby College:</strong> {listing.nearbyUniversity}</p>
                  <p>🚶 <strong className="text-slate-400">Actual Proximity:</strong> {listing.distanceFromCampus} from campus gateway</p>
                </div>
              </div>

              {/* Amenities List */}
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-100">Offered Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {listing.amenities?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-300 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col - House Rules & Maps */}
            <div className="md:col-span-4 space-y-6 text-left">
              
              {/* House Rules */}
              <div className="bg-orange-950/10 border border-orange-900/30 p-5 rounded-2xl space-y-3">
                <h3 className="text-sm font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  House Rules
                </h3>
                <p className="text-slate-300 text-xs font-medium leading-relaxed whitespace-pre-line">
                  {listing.houseRules || "Standard student hostel rules apply. No loud music, no subletting, and maintain neat hygiene."}
                </p>
              </div>

              {/* Google Maps link block */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                  Location Map
                </h3>
                
                {/* Visual mock map */}
                <div className="aspect-video w-full rounded-xl bg-slate-900 border border-slate-850 overflow-hidden relative flex flex-col justify-center items-center text-center p-4">
                  <div className="absolute inset-0 bg-cover bg-center opacity-10 filter grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80')" }} />
                  <MapPin className="w-8 h-8 text-orange-500 relative z-10 animate-bounce" />
                  <p className="text-[11px] font-bold text-slate-300 mt-2 relative z-10 truncate w-full px-2">
                    {listing.location}
                  </p>
                </div>

                <a
                  href={listing.googleMapsUrl || mapSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-orange-900/20 rounded-xl text-xs font-bold text-orange-400 bg-orange-950/10 hover:bg-orange-950/20 cursor-pointer transition-colors"
                >
                  View on Google Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
