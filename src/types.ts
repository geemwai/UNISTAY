export type RoomType = "Shared Room" | "Bedsitter" | "One Bedroom";
export type AvailabilityStatus = "Available" | "Occupied";
export type UserRole = "student" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  roomType: RoomType;
  monthlyRent: number; // minimum KSh 5,000
  location: string;
  nearbyUniversity: string;
  distanceFromCampus: string; // e.g. "500m" or "5 min walk"
  description: string;
  amenities: string[];
  availabilityStatus: AvailabilityStatus;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  datePosted: string;
  houseRules: string;
  googleMapsUrl?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  approved: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface WebSettings {
  whatsappNumber: string; // e.g. "+254712345678"
  contactEmail: string;
  aboutText: string;
}
