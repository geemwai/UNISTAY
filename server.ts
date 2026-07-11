import express from "express";
import cors from "cors"; 
import path from "path";
import fs from "fs";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { createServer as createViteServer } from "vite";

// Initialize Firebase Admin
// Load credentials from local serviceAccountKey.json or fallback to environment/project configurations
const firebaseProjectId = "unistay-8d1db";
const serviceAccountPath = process.env.RENDER
  ? "/etc/secrets/serviceAccountKey.json"
  : path.join(process.cwd(), "credentials", "serviceAccountKey.json");

if (getApps().length === 0) {
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseProjectId,
      });
      console.log("Firebase Admin initialized successfully using service account JSON.");
    } catch (err) {
      console.error("Failed to parse or initialize service account, using default project ID fallback:", err);
      initializeApp({
        credential: cert(serviceAccountPath), // also try raw path string if parse fails/is not preferred
        projectId: firebaseProjectId,
      });
    }
  } else {
    console.warn(`Service account file not found at ${serviceAccountPath}. Initializing Admin SDK using default credentials/project ID.`);
    initializeApp({
      projectId: firebaseProjectId,
    });
  }
}

const db = getFirestore();
console.log("Firestore project:", db.app.options.projectId);
const auth = getAuth();

const app = express();
const PORT = 3000;

app.use(cors({
 origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use(express.json());


// ----------------------------------------------------
// AUTO-SEEDING ROUTINES (Failsafe & Seamless Launch)
// ----------------------------------------------------
async function seedInitialData() {
  try {
    // 1. Seed Listings if empty
    const listingsSnap = await db.collection("listings").limit(1).get();
    if (listingsSnap.empty) {
      console.log("Seeding initial listings...");
      const initialListings = [
        {
          title: "Executive Spacious Bedsitter near JKUAT Main Gate",
          roomType: "Bedsitter",
          monthlyRent: 8500,
          location: "Juja, Gachororo Road",
          nearbyUniversity: "JKUAT (Jomo Kenyatta University)",
          distanceFromCampus: "5 min walk (300m)",
          description: "Premium modern bedsitter designed for student comfort. Features tiled floors, modern cabinets, security-enhanced doors, stable high-speed Wi-Fi, instant hot shower, and 24/7 borehole water supply.",
          amenities: ["High-speed Wi-Fi", "Hot Shower", "Borehole Water", "CCTV Security", "Kitchen Cabinets", "Tiled Floors"],
          availabilityStatus: "Available",
          bedrooms: 1,
          bathrooms: 1,
          images: [
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
          ],
          datePosted: new Date().toISOString(),
          houseRules: "No loud music after 10 PM. No subletting. Maintain garbage hygiene in designated bins.",
          googleMapsUrl: "https://maps.google.com/?q=JKUAT+Main+Gate"
        },
        {
          title: "Cozy Shared Room (2 Students Max) - Elite Residency",
          roomType: "Shared Room",
          monthlyRent: 5500,
          location: "Karatina, near Town Campus",
          nearbyUniversity: "Karatina University",
          distanceFromCampus: "8 min walk (600m)",
          description: "A comfortable, budget-friendly shared room perfect for university peers. Fully furnished with two study desks, built-in wardrobes, common study area, and tight perimeter-wall security.",
          amenities: ["Study Desks", "Fitted Wardrobes", "Secure Compound", "Common TV Area", "Borehole Water", "Shared Balcony"],
          availabilityStatus: "Available",
          bedrooms: 1,
          bathrooms: 1,
          images: [
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
          ],
          datePosted: new Date().toISOString(),
          houseRules: "Respect roommate privacy. Shared electricity token bills. Keep study areas tidy.",
          googleMapsUrl: "https://maps.google.com/?q=Karatina+University"
        },
        {
          title: "Modern One Bedroom Apartment - Royal Palms",
          roomType: "One Bedroom",
          monthlyRent: 14000,
          location: "Kenyatta University (KU), Ruiru Bypass",
          nearbyUniversity: "Kenyatta University",
          distanceFromCampus: "12 min walk / 3 min shuttle",
          description: "Premium executive 1-bedroom apartment featuring an elegant spacious living room, separate kitchen, backup solar energy, secure token electricity meter, ample parking, and reliable internet access.",
          amenities: ["Spacious Living Room", "Separate Kitchen", "Backup Solar Power", "Free Wi-Fi", "Gated Security", "Laundry Area"],
          availabilityStatus: "Available",
          bedrooms: 1,
          bathrooms: 1,
          images: [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
          ],
          datePosted: new Date().toISOString(),
          houseRules: "Observe quiet hours from 11 PM. Pets are not allowed. Pay rent by the 5th of each month.",
          googleMapsUrl: "https://maps.google.com/?q=Kenyatta+University"
        }
      ];

      for (const listing of initialListings) {
        await db.collection("listings").add(listing);
      }
    }

    // 2. Seed FAQs if empty
    const faqsSnap = await db.collection("faqs").limit(1).get();
    if (faqsSnap.empty) {
      console.log("Seeding initial FAQs...");
      const initialFaqs = [
        {
          question: "How do I book a room on UNISTAY?",
          answer: "Simply browse our listed rooms, filter by your institution or budget, and click on the 'Contact via WhatsApp' button. This opens a direct chat with the room administrator or landlord to schedule a viewing and complete your booking securely.",
          order: 1
        },
        {
          question: "Are these accommodation listings verified?",
          answer: "Yes! Every single listing published on UNISTAY undergoes a rigorous physical validation by our campus team to ensure the photos, amenities, security, and pricing match reality exactly.",
          order: 2
        },
        {
          question: "Is there a booking or registration fee?",
          answer: "Absolutely not. Searching, browsing, and connecting with landlords on UNISTAY is 100% free for all students. We do not charge students any brokerage or viewing fees.",
          order: 3
        },
        {
          question: "Can I reserve a room before moving in?",
          answer: "Yes, you can coordinate a reserve hold directly with the room administrator. Typically, landlords require a deposit (usually equivalent to one month's rent) to secure the unit for you.",
          order: 4
        }
      ];

      for (const faq of initialFaqs) {
        await db.collection("faqs").add(faq);
      }
    }

    // 3. Seed Reviews if empty
    const reviewsSnap = await db.collection("reviews").limit(1).get();
    if (reviewsSnap.empty) {
      console.log("Seeding initial reviews...");
      const initialReviews = [
        {
          name: "George Kariuki",
          rating: 5,
          comment: "Finding a bedsitter around Juja was extremely stressful before UNISTAY. The WhatsApp button connected me directly to the manager, and I was moved in within two days! Clean, verified rooms, and amazing experience.",
          date: new Date().toISOString(),
          approved: true
        },
        {
          name: "Mary Mwangi",
          rating: 4,
          comment: "Highly secure hostel rooms. The distance to campus was accurately specified, which was my biggest concern. No hidden viewing fees either!",
          date: new Date().toISOString(),
          approved: true
        }
      ];

      for (const review of initialReviews) {
        await db.collection("reviews").add(review);
      }
    }

    // 4. Seed Web Settings if empty
    const settingsSnap = await db.collection("settings").doc("contact").get();
    if (!settingsSnap.exists) {
      console.log("Seeding initial settings...");
      await db.collection("settings").doc("contact").set({
        whatsappNumber: "+254142606140",
        contactEmail: "unistay.support@gmail.com",
        aboutText: "UNISTAY is one of Kenya's dedicated student accommodation finder developed by students for students. We eliminate the middleman and physical stress by providing a curated, verified directory of rooms, bedsitters, and shared apartments near primary higher-learning institutions."
      });
    }

  } catch (err) {
    console.error("Auto-seeding encountered an error:", err);
  }
}

// Execute seeding on boot
seedInitialData();

// ----------------------------------------------------
// AUTH MIDDLEWARE (Secures Admin Rest Endpoints)
// ----------------------------------------------------
async function checkAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Access Token is required." });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Administrator privilege required." });
    }

    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error("Authorization check failed:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
  }
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. User Profile Sync / Registration Verification
app.post("/api/register", async (req, res) => {
  try {
    const { uid, email, name } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: "Missing uid or email." });
    }

    const userDocRef = db.collection("users").doc(uid);
    const existingUser = await userDocRef.get();

    if (existingUser.exists) {
      return res.json({ status: "exists", profile: existingUser.data() });
    }

    // Auto-promote ndungumwaigeorge@gmail.com or admin domains to admin role for ease of review
    let role = "student";
    if (
      email.toLowerCase() === "ndungumwaigeorge@gmail.com" ||
      email.toLowerCase() === "unistay.support@gmail.com"
    ) {
      role = "admin";
      console.log(`Promoting ${email} to Admin on registration.`);
    }

    const profile = {
      uid,
      email,
      name: name || "Student User",
      role,
      createdAt: new Date().toISOString(),
    };

    await userDocRef.set(profile);
    return res.json({ status: "created", profile });
  } catch (error: any) {
    console.error("Error creating user profile:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get user profile role info
app.get("/api/users/profile/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Profile not found" });
    }
    return res.json(userDoc.data());
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET all users (Admin only)
app.get("/api/users", checkAdmin, async (req, res) => {
  try {
    const snap = await db.collection("users").orderBy("createdAt", "desc").get();
    const users: any[] = [];
    snap.forEach((doc) => {
      users.push(doc.data());
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Room Listings
app.get("/api/listings", async (req, res) => {
  try {
    const snap = await db.collection("listings").orderBy("datePosted", "desc").get();
    const listings: any[] = [];
    snap.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() });
    });
    return res.json(listings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/listings", checkAdmin, async (req, res) => {
  try {
    const listingData = req.body;
    
    // Server-side validation
    if (listingData.monthlyRent < 5000) {
      return res.status(400).json({ error: "Monthly rent must be at least KSh 5,000." });
    }

    const docRef = await db.collection("listings").add({
      ...listingData,
      datePosted: new Date().toISOString(),
    });

    return res.json({ id: docRef.id, message: "Listing created successfully!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/listings/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.monthlyRent && updateData.monthlyRent < 5000) {
      return res.status(400).json({ error: "Monthly rent must be at least KSh 5,000." });
    }

    await db.collection("listings").doc(id).update(updateData);
    return res.json({ message: "Listing updated successfully!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/listings/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("listings").doc(id).delete();
    return res.json({ message: "Listing deleted successfully!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const snap = await db.collection("reviews").orderBy("date", "desc").get();
    const reviews: any[] = [];
    snap.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return res.json(reviews);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
      return res.status(400).json({ error: "Missing required review fields" });
    }

    const newReview = {
      name,
      rating: Number(rating),
      comment,
      date: new Date().toISOString(),
      approved: false, // Default unapproved, Admin needs to approve
    };

    const docRef = await db.collection("reviews").add(newReview);
    return res.json({ id: docRef.id, message: "Review submitted for moderator approval!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Review moderations (Admin only)
app.put("/api/reviews/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;
    await db.collection("reviews").doc(id).update({ approved });
    return res.json({ message: `Review approval status updated to ${approved}` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/reviews/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("reviews").doc(id).delete();
    return res.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. FAQs API
app.get("/api/faqs", async (req, res) => {
  try {
    const snap = await db.collection("faqs").orderBy("order", "asc").get();
    const faqs: any[] = [];
    snap.forEach((doc) => {
      faqs.push({ id: doc.id, ...doc.data() });
    });
    return res.json(faqs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/faqs", checkAdmin, async (req, res) => {
  try {
    const faq = req.body;
    const docRef = await db.collection("faqs").add(faq);
    return res.json({ id: docRef.id, message: "FAQ created successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/faqs/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const faq = req.body;
    await db.collection("faqs").doc(id).update(faq);
    return res.json({ message: "FAQ updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/faqs/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("faqs").doc(id).delete();
    return res.json({ message: "FAQ deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Global Settings
app.get("/api/settings", async (req, res) => {
  try {
    const doc = await db.collection("settings").doc("contact").get();
    if (doc.exists) {
      return res.json(doc.data());
    } else {
      return res.status(404).json({ error: "Settings not found" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/settings", checkAdmin, async (req, res) => {
  try {
    const settings = req.body;
    await db.collection("settings").doc("contact").set(settings, { merge: true });
    return res.json({ message: "Settings saved successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER AND PRODUCTION ASSET SERVING
// ----------------------------------------------------
async function initializeViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA Fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UNISTAY full-stack server running on http://localhost:${PORT}`);
  });
}

initializeViteMiddleware();
