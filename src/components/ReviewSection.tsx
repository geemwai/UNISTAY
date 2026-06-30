import React, { useState, useMemo } from "react";
import { Star, MessageSquare, BadgeCheck, AlertCircle, Sparkles } from "lucide-react";
import { Review } from "../types";

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (name: string, rating: number, comment: string) => Promise<boolean>;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export default function ReviewSection({
  reviews,
  onAddReview,
  isLoggedIn,
  onOpenAuth,
}: ReviewSectionProps) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filter approved reviews for public viewing
  const approvedReviews = useMemo(() => {
    return reviews.filter((r) => r.approved);
  }, [reviews]);

  // Compute average rating
  const stats = useMemo(() => {
    if (approvedReviews.length === 0) return { avg: 5.0, count: 0 };
    const sum = approvedReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return {
      avg: Number((sum / approvedReviews.length).toFixed(1)),
      count: approvedReviews.length,
    };
  }, [approvedReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) {
      setSubmitMessage({ text: "Please enter your name and comments.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    const success = await onAddReview(name, rating, comment);
    setIsSubmitting(false);

    if (success) {
      setSubmitMessage({
        text: "🎉 Thank you! Your review has been submitted and is currently pending administrator moderation.",
        type: "success",
      });
      setName("");
      setRating(5);
      setComment("");
    } else {
      setSubmitMessage({
        text: "Failed to submit review. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <section className="py-20 bg-slate-950 min-h-screen border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
            Student Reviews & Experiences
          </h2>
          <p className="text-slate-400 mt-3 text-base sm:text-lg font-medium">
            Read authentic reviews from fellow university peers or share your own student stay experiences.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Stats & Reviews Feed */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Aggregate Stats Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6.5 shadow-none flex flex-col sm:flex-row items-center gap-8 text-left">
              <div className="text-center sm:text-left shrink-0">
                <span className="block text-5xl font-black text-orange-500 font-mono">
                  {stats.avg}
                </span>
                <div className="flex gap-1.5 justify-center sm:justify-start mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4.5 h-4.5 ${
                        star <= Math.round(stats.avg)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-800"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase mt-3 tracking-wider">
                  Based on {stats.count} reviews
                </p>
              </div>

              <div className="flex-1 w-full space-y-2 border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-8 pt-6 sm:pt-0">
                <h4 className="text-sm font-bold text-slate-200">Why students love UNISTAY</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Every listed accommodation is physically verified by students, for students. No surprise commissions, and completely free direct contact with landlords.
                </p>
                <div className="flex gap-2 items-center text-xs text-emerald-400 bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-900/30 w-fit font-bold">
                  <BadgeCheck className="w-4 h-4 shrink-0" /> Physical inspection guarantee
                </div>
              </div>
            </div>

            {/* Reviews Feed */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-100 flex items-center gap-2 text-left">
                <MessageSquare className="w-5 h-5 text-orange-500" /> Reviews ({approvedReviews.length})
              </h3>

              {approvedReviews.length > 0 ? (
                <div className="space-y-4">
                  {approvedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-none text-left space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-200 text-[15px]">{review.name}</h4>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {new Date(review.date).toLocaleDateString("en-KE", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-slate-800"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center shadow-none">
                  <p className="text-slate-400 font-medium">No verified reviews yet. Be the first to share!</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Write Review Form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-none space-y-6 text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Share feedback
              </div>
              <h3 className="text-xl font-black text-slate-100">Write a Review</h3>
              <p className="text-slate-400 text-xs font-semibold">
                Your feedback helps thousands of students find high-quality rentals safely.
              </p>
            </div>

            {isLoggedIn ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1.5 rounded-lg hover:bg-slate-950 cursor-pointer transition-colors"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-800 hover:text-yellow-300"
                          } transition-all`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-200 transition-all placeholder:text-slate-500"
                  />
                </div>

                {/* Comments */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Review Comment
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your room's condition, landlord cooperation, security, or overall stay..."
                    className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-200 transition-all resize-none placeholder:text-slate-500"
                  />
                </div>

                {submitMessage && (
                  <div
                    className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                      submitMessage.type === "success"
                        ? "bg-emerald-950/20 border border-emerald-900/30 text-emerald-400"
                        : "bg-red-950/20 border border-red-900/30 text-red-400"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitMessage.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-850 disabled:text-slate-600 text-slate-950 font-extrabold text-sm tracking-wider uppercase shadow hover:shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
                
              </form>
            ) : (
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl text-center space-y-4">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-slate-300 text-xs font-semibold">
                  You must be registered or logged in to leave a review.
                </p>
                <button
                  onClick={onOpenAuth}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs tracking-wider uppercase cursor-pointer transition-colors"
                >
                  Log In to Write Review
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
