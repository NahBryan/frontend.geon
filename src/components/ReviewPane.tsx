import { Star } from "lucide-react";

// 2. Customer Evaluation / Review Pane Component
export const ReviewPaneDeck = () => {
  const reviews = [
    {
      quote:
        "The 3D satellite elevation layer allowed our agricultural union to successfully map moisture retention thresholds across 400+ coordinate matrices in the West Region.",
      author: "Amadou Toumani",
      role: "User, Local Farmer Cooperative",
      location: "Bafoussam, Cameroon",
    },
    {
      quote:
        "Being able to pull automated price forecasting algorithms directly adjacent to soil suitability reports radically minimized our pre-harvest logistical expenditures.",
      author: "Dr. Elsie Effa",
      role: "Lead Environmental Analyst",
      location: "Douala, Cameroon",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600">
            Validated Operator Feedback
          </span>
          <h2 className="text-3xl font-serif text-stone-900 tracking-tight">
            Trusted across regional coordinate sectors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between space-y-6 relative"
            >
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-stone-700 text-sm italic font-medium leading-relaxed flex-1">
                "{r.quote}"
              </p>
              <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    {r.author}
                  </h4>
                  <p className="text-[11px] text-stone-500">{r.role}</p>
                </div>
                <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                  {r.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
