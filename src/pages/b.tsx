import React, { useState } from "react";
import {
  Activity,
  Map,
  Layers,
  TrendingUp,
  Globe,
  ShieldAlert,
  Clock,
  LayoutDashboard,
} from "lucide-react";

// Mock Constants to make it self-contained
const CROPS = [
  { name: "maize", label: "Maize (Corn)" },
  { name: "wheat", label: "Winter Wheat" },
  { name: "soybeans", label: "Soybeans" },
  { name: "rice", label: "Oryza Sativa (Rice)" },
];

export default function AgriRiskDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mapMode, setMapMode] = useState("satellite");
  const [selectedCrop, setSelectedCrop] = useState("maize");
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 8.732,
    lng: 9.352,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans p-6 md:p-8 selection:bg-green-500/10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ================= HEADER & NAVIGATION ================= */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm uppercase tracking-wider mb-1">
              <Globe size={16} />
              <span>Geon Core Engine v2.4</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Analytical Workspace Terminal
            </h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-200/60 p-1 rounded-xl border border-slate-200 w-fit">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("suitability")}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === "suitability"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers size={14} />
              Suitability Matrix
            </button>
          </nav>
        </header>

        {/* ================= INTERACTIVE WORKSPACE GRID ================= */}
        {activeTab === "dashboard" && (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ================= HIGH-DENSITY METRICS SHELF ================= */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Target Coordinates",
                  val: `${selectedLocation.lat.toFixed(4)}°N , ${selectedLocation.lng.toFixed(4)}°E`,
                  desc: "Active matrix cell anchor",
                  icon: Map,
                  color: "text-blue-600",
                },
                {
                  label: "Regional Risk Index",
                  val: "4.12 / 10",
                  desc: "Low-to-moderate variance detected",
                  icon: ShieldAlert,
                  color: "text-amber-500",
                },
                {
                  label: "Forecasted Yield Delta",
                  val: "+14.2%",
                  desc: "Based on dynamic model projection",
                  icon: TrendingUp,
                  color: "text-green-600",
                },
                {
                  label: "Active Engine Pipelines",
                  val: "4 Systems Active",
                  desc: "All background tasks synchronized",
                  icon: Activity,
                  color: "text-purple-600",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {card.label}
                    </span>
                    <card.icon size={16} className={card.color} />
                  </div>
                  <p className="text-lg font-bold text-slate-900 tracking-tight">
                    {card.val}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {card.desc}
                  </p>
                </div>
              ))}
            </section>

            {/* Map Column (Spans 2 columns) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Geospatial Array Realtime Selection Raster Matrix
                </h3>

                {/* 🗺️ Map view state control panel */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit self-start sm:self-auto">
                  <button
                    onClick={() => setMapMode("satellite")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-150 border-none outline-none cursor-pointer ${
                      mapMode === "satellite"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setMapMode("terrain")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-150 border-none outline-none cursor-pointer ${
                      mapMode === "terrain"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Terrain
                  </button>
                </div>
              </div>

              {/* Dynamic Map Component Simulation */}
              <div className="relative bg-slate-900 w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex flex-col items-center justify-center text-center p-6 group">
                {/* Simulated Grid Background overlay change */}
                <div
                  className={`absolute inset-0 opacity-20 transition-all duration-300 bg-grid ${mapMode === "satellite" ? "bg-cyan-500" : "bg-emerald-500"}`}
                />

                <div className="relative z-10 space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-white/10 backdrop-blur-md text-white mb-2 animate-pulse">
                    <Map size={24} />
                  </div>
                  <p className="text-white font-bold text-sm tracking-wide">
                    {mapMode === "satellite"
                      ? "🛰️ SATURATED IMAGERY RASTER PASS ACTIVE"
                      : "⛰️ TOPOGRAPHICAL ELEVATION MESH GENERATED"}
                  </p>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">
                    Simulated resolution targeting point center{" "}
                    <span className="text-green-400 font-mono">
                      {selectedLocation.lat.toFixed(3)},{" "}
                      {selectedLocation.lng.toFixed(3)}
                    </span>
                    . Click mock control items to test reactive hooks.
                  </p>
                </div>

                {/* Coordinate HUD readout overlay */}
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-400">
                  LAT_X: {selectedLocation.lat} // LNG_Y: {selectedLocation.lng}
                </div>
              </div>
            </div>

            {/* Configurations Column */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Workspace Configurations
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wide">
                    Active Crop Focus
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all cursor-pointer appearance-none"
                  >
                    {CROPS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Variable Control Parameter for UI Depth */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wide">
                    Confidence Interval Sensitivity
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-150">
                    <input
                      type="range"
                      min="80"
                      max="99"
                      defaultValue="95"
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <span className="text-xs font-mono font-bold text-slate-600">
                      95%
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner Component */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                  <Activity
                    size={14}
                    className="text-green-600 animate-pulse"
                  />
                  <span>3D Terrain Profiler Live</span>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Use the map view switch to adjust the elevation mesh layer.
                  Click anywhere on the matrix array to compute dynamic regional
                  adaptation parameters.
                </p>
              </div>
            </div>
            {/* ================= SECONDARY ACTIVITY FEED / LOGS ================= */}
            <footer className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Clock size={14} />
                <h3>Deduplication Engine Log Feed</h3>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {[
                  {
                    path: "/api/v1/risk-score",
                    status: "200 OK",
                    cache: "HIT",
                    time: "Just Now",
                  },
                  {
                    path: "/api/v1/crop-suitability",
                    status: "200 OK",
                    cache: "MISS",
                    time: "3 mins ago",
                  },
                  {
                    path: "/api/v1/price-forecast",
                    status: "200 OK",
                    cache: "HIT",
                    time: "12 mins ago",
                  },
                ].map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 font-mono"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-slate-700 font-medium">
                        {log.path}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-bold text-[10px]">
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span
                        className={`text-[10px] font-bold px-1 rounded ${log.cache === "HIT" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}
                      >
                        CACHE_{log.cache}
                      </span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </footer>
          </main>
        )}
      </div>
    </div>
  );
}
