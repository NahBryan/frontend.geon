import { 
  Sprout, ArrowRight
} from "lucide-react";

// 3. Global Corporate Footer Component
export const CorporateFooter = ({ onNavAuth }: { onNavAuth: () => void }) => {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/10 bg-[#0b0f0d] text-stone-300">
      
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-lime-400/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-9">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
                <Sprout size={18} className="text-white" />
              </div>

              <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  GEoN
                  <span className="ml-1 text-emerald-400">ML</span>
                </h2>
                <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">
                  Precision Agriculture Intelligence
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-7 text-stone-400">
              Enterprise-grade geospatial analytics platform delivering
              predictive agricultural intelligence, localized climate risk
              modeling, and AI-powered yield optimization across Cameroon.
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Infrastructure Operational
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Platform
            </h4>

            <ul className="space-y-3 text-sm">
              {[
                "Satellite Mapping",
                "Crop Intelligence",
                "Price Forecasting",
                "Yield Telemetry",
              ].map((item) => (
                <li key={item}>
                  <button className="group flex items-center gap-2 text-stone-400 transition-colors hover:text-emerald-400">
                    <span className="h-1 w-1 rounded-full bg-stone-600 transition-colors group-hover:bg-emerald-400" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Governance
            </h4>

            <ul className="space-y-3 text-sm">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Security Standards",
                "Compliance",
              ].map((item) => (
                <li key={item}>
                  <button className="group flex items-center gap-2 text-stone-400 transition-colors hover:text-emerald-400">
                    <span className="h-1 w-1 rounded-full bg-stone-600 transition-colors group-hover:bg-emerald-400" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Card */}
          <div className="lg:col-span-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 to-stone-950 p-6 shadow-2xl">
              
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  AI Deployment Ready
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    Launch localized agricultural intelligence pipelines
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-stone-400">
                    Deploy custom AI-driven satellite analysis systems and
                    predictive risk infrastructure tailored to regional farming
                    ecosystems.
                  </p>
                </div>

                <button
                  onClick={onNavAuth}
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Provision Platform
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-6 text-xs text-stone-500 sm:flex-row">
          
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span>
              © {new Date().getFullYear()} GEoN ML. All rights reserved.
            </span>

            <span className="hidden sm:block text-stone-700">•</span>

            <span>
              Built for scalable agronomic intelligence infrastructure.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              v2.4.0 Stable
            </div>

            <div className="flex items-center gap-2 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};