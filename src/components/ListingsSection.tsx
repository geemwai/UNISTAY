import React, { useState, useMemo } from "react";
import { Search, MapPin, GraduationCap, DollarSign, Eye, BadgePercent, Inbox, SlidersHorizontal, CheckCircle, XCircle } from "lucide-react";
import { Listing, RoomType, AvailabilityStatus } from "../types";

interface ListingsSectionProps {
  listings: Listing[];
  onViewDetails: (listing: Listing) => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export default function ListingsSection({
  listings,
  onViewDetails,
  isLoggedIn,
  onOpenAuth,
}: ListingsSectionProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("All");
  const [maxBudget, setMaxBudget] = useState<number>(25000);
  const [locationQuery, setLocationQuery] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState<string>("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique universities for dropdown filter
  const universities = useMemo(() => {
    const list = new Set<string>();
    listings.forEach((item) => {
      if (item.nearbyUniversity) {
        // Extract common initials or abbreviations to group logically
        let name = item.nearbyUniversity;
        if (name.includes("JKUAT")) name = "JKUAT";
        else if (name.includes("Karatina")) name = "Karatina University";
        else if (name.includes("Kenyatta")) name = "Kenyatta University";
        list.add(name);
      }
    });
    return Array.from(list);
  }, [listings]);

  // Filter listings list dynamically in-memory
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // 1. General search query (title, nearbyUniversity, description)
      const textMatch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nearbyUniversity.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Room Type filter
      const typeMatch = roomTypeFilter === "All" || item.roomType === roomTypeFilter;

      // 3. Location text filter
      const locationMatch =
        locationQuery === "" ||
        item.location.toLowerCase().includes(locationQuery.toLowerCase());

      // 4. University filter
      const uniMatch =
        institutionFilter === "All" ||
        item.nearbyUniversity.toLowerCase().includes(institutionFilter.toLowerCase());

      // 5. Budget filter (minimum is KSh 5,000, so we check if within limit)
      const budgetMatch = item.monthlyRent <= maxBudget;

      // 6. Availability status filter
      const availMatch =
        availabilityFilter === "All" || item.availabilityStatus === availabilityFilter;

      return textMatch && typeMatch && locationMatch && uniMatch && budgetMatch && availMatch;
    });
  }, [listings, searchQuery, roomTypeFilter, locationQuery, institutionFilter, maxBudget, availabilityFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setRoomTypeFilter("All");
    setMaxBudget(25000);
    setLocationQuery("");
    setInstitutionFilter("All");
    setAvailabilityFilter("All");
  };

  return (
    <section id="available-rooms" className="py-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            Explore Available Accommodation
          </h2>
          <p className="text-slate-400 mt-3 text-base sm:text-lg font-medium">
            Find and book physically-verified rooms tailored to your budget and campus proximity.
          </p>
        </div>

        {/* Search and Filters Glassmorphic Bar */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-none p-6 mb-10 space-y-6">
          
          {/* Main search line */}
          <div className="flex flex-col lg:flex-row gap-4">
            
            <div className="flex-1 relative">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords, hostels, or universities..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-[15px] font-medium text-slate-200 transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-4 rounded-xl border font-bold text-sm tracking-wide transition-all cursor-pointer ${
                  showFilters 
                    ? "border-orange-500 bg-orange-950/20 text-orange-400" 
                    : "border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Filters
              </button>

              <button
                onClick={resetFilters}
                className="px-5 py-4 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 text-sm font-semibold tracking-wide cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>

          </div>

          {/* Collapsible advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-800/60 animate-fade-in">
              
              {/* Room Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Room Type</label>
                <select
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  <option value="All" className="bg-slate-900">All Types</option>
                  <option value="Shared Room" className="bg-slate-900">Shared Room</option>
                  <option value="Bedsitter" className="bg-slate-900">Bedsitter</option>
                  <option value="One Bedroom" className="bg-slate-900">One Bedroom</option>
                </select>
              </div>

              {/* Institution Filter */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nearby University</label>
                <select
                  value={institutionFilter}
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  <option value="All" className="bg-slate-900">All Campuses</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni} className="bg-slate-900">{uni}</option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Availability</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  <option value="All" className="bg-slate-900">All Statuses</option>
                  <option value="Available" className="bg-slate-900">Available</option>
                  <option value="Occupied" className="bg-slate-900">Occupied</option>
                </select>
              </div>

              {/* Budget Range */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Budget (KSh)</label>
                  <span className="text-sm font-extrabold text-orange-400 font-mono">
                    KSh {maxBudget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="25000"
                  step="500"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full h-2 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                  <span>5,000</span>
                  <span>15,000</span>
                  <span>25,000+</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Verification Notification */}
        {!isLoggedIn && (
          <div className="mb-8 p-4.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-semibold text-center sm:text-left">
              🔒 <strong>Sign-in is required</strong> to view room layouts, amenities, maps, and access direct WhatsApp contacts.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-4.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs tracking-wide cursor-pointer transition-all shrink-0"
            >
              Sign In to Unlock
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((room) => (
              <div
                key={room.id}
                className="group bg-slate-900 rounded-3xl border border-slate-800/80 hover:border-slate-700 overflow-hidden shadow-none hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                {/* Card Image and badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                  <img
                    src={room.images?.[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Monthly Rent Badge */}
                  <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-white/5 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-sm font-mono shadow-md">
                    KSh {room.monthlyRent.toLocaleString()}<span className="text-[11px] font-normal text-slate-300">/mo</span>
                  </div>

                  {/* Availability Badge */}
                  <div className="absolute top-4 right-4 shadow-sm">
                    {room.availabilityStatus === "Available" ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/95 text-white text-xs font-black px-3 py-1.5 rounded-xl">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-rose-500/95 text-white text-xs font-black px-3 py-1.5 rounded-xl">
                        <XCircle className="w-3.5 h-3.5" />
                        Occupied
                      </span>
                    )}
                  </div>

                  {/* Room Type Tag Overlaid */}
                  <div className="absolute bottom-4 left-4 bg-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow">
                    {room.roomType}
                  </div>
                </div>

                {/* Card content */}
                <div className="p-6 flex flex-col flex-1 space-y-4 text-left">
                  
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-slate-100 group-hover:text-orange-400 transition-colors leading-snug line-clamp-1">
                      {room.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate">{room.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                      <GraduationCap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate">{room.nearbyUniversity} ({room.distanceFromCampus})</span>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">
                    {room.description}
                  </p>

                  {/* Amenities Quick list */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {room.amenities?.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold text-slate-300 bg-slate-950 px-2 py-1 rounded-md border border-slate-800"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities?.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-500 px-1 py-1">
                        +{room.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-auto">
                    <button
                      onClick={() => onViewDetails(room)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-slate-950 font-bold text-xs tracking-wider uppercase cursor-pointer transition-all duration-300"
                    >
                      <Eye className="w-4 h-4" />
                      {isLoggedIn ? "View Details" : "Unlock Details"}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-16 text-center shadow-none max-w-xl mx-auto">
            <Inbox className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-200">No rooms match your filters</h3>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              Try adjusting your max budget slider, clearing your location query, or selecting another room category.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold tracking-wider uppercase cursor-pointer transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
