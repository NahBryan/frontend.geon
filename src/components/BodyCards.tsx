import { Database, Wheat, CloudRain } from "lucide-react";
export const BodyContentMesh = () => {
  const pillars = [
    {
      Icon: CloudRain,
      title: "Climatic Precipitation Grids",
      desc: "Track long-term micro-climate historical cycles specifically optimized for sub-Saharan environmental anomalies.",
    },
    {
      Icon: Database,
      title: "Machine Learning Yield Matrix",
      desc: "Run predictive analytics factoring in structural elevation vectors, chemical soil properties, and canopy indices.",
    },
    {
      Icon: Wheat,
      title: "Macro-Economic Commodity Deltas",
      desc: "Protect your profit margins by analyzing pricing volatility markers aggregated directly from local regional markets.",
    },
  ];

  return (
    <section className="py-20 bg-white border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Platform Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900 tracking-tight">
            Engineered to overcome geographical fragmentation and climate
            volatility.
          </h2>
          <p className="text-stone-600 text-sm md:text-base">
            GEoN ML replaces estimation with verifiable WebGL and machine
            learning processing paradigms, equipping institutional stakeholders
            and local operator syndicates with high-fidelity telemetry records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4 hover:border-emerald-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                <p.Icon size={18} />
              </div>
              <h3 className="text-base font-bold text-stone-900">{p.title}</h3>
              <p className="text-stone-600 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
