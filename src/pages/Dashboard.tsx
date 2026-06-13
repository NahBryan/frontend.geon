/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Calendar,
  Loader2,
  Sparkles,
  TrendingUp,
  Sprout,
  Clock,
  Database,
  CheckCircle,
  Zap,
  MapPin,
  BarChart3,
  Download,
  FileText,
  FileClock,
  CheckCircle2,
  HourglassIcon,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Lightbulb,
  Thermometer,
  Droplets,
  CloudRain,
  Mountain,
  Compass,
  Cpu,
} from "lucide-react";
import { Map as MapPicker } from "@/components/MapPicker";
import { CROPS } from "@/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Map } from "@/components/Map";
import { fetchYieldPrediction as YieldPrediction } from "@/helper/requests/yieldprediction.request";
import { fetchForecast as forecast } from "@/helper/requests/forecast.request";
import { fetchRiskScore as Risk } from "@/helper/requests/risk.request";
import { fetchSuitability as Suitability } from "@/helper/requests/cropsuitability.request";
import {
  fetchHistory as History,
  fetchReports as Reports,
  GenerateReports,
  DownloadReports,
} from "@/helper/requests/history.request";
import { useAuth } from "@/context/AuthContext";
import { sileo } from "sileo";
import type {
  HistoryResponse,
  ReportStatus,
  RiskScoreResponse,
  ForecastResponse,
  SuitabilityResponse,
} from "@/types";
interface DashboardProps {
  mockMode: boolean;
  activeTab: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState("maize");
  const [duration, setDuration] = useState(2);
  const [durationType, setDurationType] = useState("months");
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null,
  );
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [fertilizerType, setFertilizerType] = useState("organic");
  const [irrigation, setIrrigation] = useState(false);
  const [loadingYield, setLoadingYield] = useState(false);
  const [yieldPrediction, setYieldPrediction] = useState<any>(null);
  const { globalLandSize } = useAuth();
  const [selectedLocation, setSelectedLocation] =
    useState<LocationPayload | null>(null);
  const [generatingReports, setGeneratingReports] = useState<
    Record<string, boolean>
  >({});
  const [reportFormats, setReportFormats] = useState<
    Record<string, "json" | "pdf">
  >({});
  const [generatedReports, setGeneratedReports] = useState<
    Record<string, ReportStatus>
  >({});
  const [myReports, setMyReports] = useState<ReportStatus[]>([]);
  const [loadingMyReports, setLoadingMyReports] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingSuitability, setLoadingSuitability] = useState(false);
  const [marketAccess, setMarketAccess] = useState("moderate");
  const [mapMode, setMapMode] = useState<"satellite" | "terrain">("satellite");
  const [suitabilityData, setSuitabilityData] =
    useState<SuitabilityResponse | null>(null);
  const allowedDurationTypes = useMemo(() => {
    const tier = user?.subscription_type || "free";
    if (tier === "premium") {
      return ["days", "weeks", "months"];
    }
    if (tier === "medium") {
      return ["weeks", "months"];
    }
    return ["months"];
  }, [user?.subscription_type]);

  useEffect(() => {
    if (!allowedDurationTypes.includes(durationType)) {
      setDurationType(allowedDurationTypes[0]);
    }
    if (activeTab === "history") {
      fetchHistory();
    }
    if (activeTab === "reports") {
      fetchMyReports();
    }
  }, [allowedDurationTypes, durationType, activeTab]);

  const fetchForecast = async () => {
    try {
      setLoadingForecast(true);
      const response = await forecast(duration, durationType, selectedCrop);
      setForecastData(response);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Encountered An Error Fetching Forecast",
        description:
          "Unable to fetch forecast data. Check Console for details.",
        duration: 3000, // Keeps the layout on screen for 3 seconds instead of the default 6
      });
    } finally {
      setLoadingForecast(false);
    }
  };

  const fetchSuitability = async () => {
    try {
      setLoadingSuitability(true);
      const response = await Suitability(
        selectedLocation.lat,
        selectedLocation.lng,
      );
      setSuitabilityData(response);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Encountered An Error Fetching Suitability Data",
        description:
          "Unable to fetch suitability data. Check Console for details.",
        duration: 3000, // Keeps the layout on screen for 3 seconds instead of the default 6
      });
    } finally {
      setLoadingSuitability(false);
    }
  };

  const fetchYieldPrediction = async () => {
    if (!selectedLocation) return;

    try {
      setLoadingYield(true);
      const location = {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      };
      const data = await YieldPrediction(
        selectedCrop,
        fertilizerType,
        irrigation,
        Number(globalLandSize.toFixed(2)),
        location,
      );
      setYieldPrediction(data);
    } catch (error) {
      console.error(error);
      sileo.error({
        title: "Encountered An Error Fetching Yield Prediction",
        description:
          "Unable to fetch yield prediction data. Check Console for details.",
        duration: 3000, // Keeps the layout on screen for 3 seconds instead of the default 6
      });
    } finally {
      setLoadingYield(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await History();
      setHistoryData(data);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Failed to Load History",
        description:
          "Unable to fetch activity history. Check Console for details.",
        duration: 3000,
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateReport = async (analysisType: string, resultId: string) => {
    const typeMap: Record<string, string> = {
      yield_predictions: "yield_prediction",
      forecasts: "price_forecast",
      suitability_results: "crop_suitability",
      risk_scores: "risk_score",
    };
    const mappedType = typeMap[analysisType] ?? analysisType;
    const format = reportFormats[resultId] ?? "json";

    setGeneratingReports((prev) => ({ ...prev, [resultId]: true }));
    try {
      const { data } = await GenerateReports(mappedType, resultId, format);
      setGeneratedReports((prev) => ({ ...prev, [resultId]: data }));
      sileo.success({
        title: "Report Generated",
        description: `Your ${format.toUpperCase()} report is ready to download.`,
        duration: 3000,
      });
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Report Generation Failed",
        description: "Could not generate report. Check console.",
        duration: 5000,
      });
    } finally {
      setGeneratingReports((prev) => ({ ...prev, [resultId]: false }));
    }
  };

  const fetchMyReports = async () => {
    setLoadingMyReports(true);
    try {
      const data = await Reports();
      setMyReports(data);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Failed to Load Reports",
        description: "Could not fetch your reports.",
        duration: 3000,
      });
    } finally {
      setLoadingMyReports(false);
    }
  };

  const downloadReport = async (reportId: string, format: string = "json") => {
    setDownloadingReport(true);
    try {
      const data = await DownloadReports(reportId, format);

      const mimeType =
        format === "pdf" ? "application/pdf" : "application/json";
      const extension = format === "pdf" ? "pdf" : "json";

      const blob = new Blob(
        format === "pdf" ? [data] : [JSON.stringify(data, null, 2)],
        { type: mimeType },
      );

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `report-${reportId}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Download Failed",
        description: "Could not download the report. Check console.",
        duration: 3000,
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  const fetchRisk = async () => {
    if (!selectedLocation) return;
    setLoadingRisk(true);
    try {
      const data = await Risk(
        selectedCrop,
        Number(globalLandSize.toFixed(2)),
        selectedLocation.lat,
        selectedLocation.lng,
        marketAccess,
      );
      setRiskData(data);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Risk Score Failed",
        description: "Could not compute risk score. Check console.",
        duration: 3000,
      });
    } finally {
      setLoadingRisk(false);
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full bg-slate-50 text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4 bg-transparent">
        <div>
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
            Processing Node Layer
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mt-1">
            {activeTab === "dashboard" && "Geon Core Engine v2.4"}
            {activeTab === "suitability" &&
              "Geospatial Suitability Classification Map"}
            {activeTab === "history" && "Analysis Activity History"}
            {activeTab === "reports" && "My Generated Reports"}
            {activeTab === "risk" && "Agricultural Risk Assessment"}
          </h1>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setMapMode("satellite")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-150 border-none outline-none cursor-pointer ${
              mapMode === "satellite"
                ? "bg-white text-slate-800 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Satellite
          </button>

          <button
            onClick={() => setMapMode("terrain")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-150 border-none outline-none cursor-pointer ${
              mapMode === "terrain"
                ? "bg-white text-slate-800 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Terrain
          </button>
        </div>
      </div>
      {activeTab === "dashboard" && (
        <>
          {/* ================= HIGH-DENSITY METRICS SHELF ================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Target Coordinates",
                val: `°N , °E`,
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
                  {/* <card.icon size={16} className={card.color} /> */}
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
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Column (Spans 2 columns) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Geospatial Array Realtime Selection Raster Matrix
                </h3>
              </div>

              {/* Dynamic Map Component Simulation */}
              <div className="relative bg-slate-900 w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex flex-col items-center justify-center text-center p-6 group">
                {/* Simulated Grid Background overlay change */}
                <div
                  className={`absolute inset-0 opacity-20 transition-all duration-300 bg-grid ${mapMode === "satellite" ? "bg-cyan-500" : "bg-emerald-500"}`}
                />

                <div className="relative z-10 space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-white/10 backdrop-blur-md text-white mb-2 animate-pulse">
                    <MapPin size={24} />
                  </div>
                  <p className="text-white font-bold text-sm tracking-wide">
                    {mapMode === "satellite"
                      ? " SATURATED IMAGERY RASTER PASS ACTIVE"
                      : " TOPOGRAPHICAL ELEVATION MESH GENERATED"}
                  </p>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">
                    Simulated resolution targeting point center{" "}
                    <span className="text-green-400 font-mono">
                      {8}, {5}
                    </span>
                    . Click mock control items to test reactive hooks.
                  </p>
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
          </main>
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
                {
                  path: "/api/v1/yield-prediction",
                  status: "200 OK",
                  cache: "MISS",
                  time: "15 mins ago",
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
        </>
      )}
      {activeTab === "suitability" && (
        // FIX 1: Changed lg:grid-rows-3 back to lg:grid-cols-3 to support column spans
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* ================= LEFT/MAIN WORKSPACE COLUMN ================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Canvas Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Geospatial Array Realtime Selection Raster Matrix
                </h3>
              </div>

              {/* FIX 2: Removed the placeholder utility layout classes.
          Map canvases require an explicit relative height container to render properly.
        */}
              <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <MapPicker
                  mapType={mapMode || "satellite"}
                  selectedLocation={selectedLocation}
                  onSelect={(location) => {
                    setSelectedLocation(location);
                  }}
                />
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={fetchSuitability}
                disabled={loadingSuitability}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 border-none cursor-pointer outline-none"
              >
                {loadingSuitability ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Analyze Suitability</span>
                  </>
                )}
              </button>
            </div>

            {/* ENVIRONMENTAL TELEMETRY EXPANSION GRID */}
            {suitabilityData && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Extracted Environmental Raster Parameters
                  </h3>
                  <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-slate-600 flex items-center gap-1">
                    <Compass size={10} /> {suitabilityData.region_estimate}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[
                    {
                      label: "Soil pH",
                      val: suitabilityData.soil_ph,
                      unit: "pH",
                      icon: Sprout,
                      color: "text-emerald-600",
                      bg: "bg-emerald-50/50",
                    },
                    {
                      label: "Mean Rainfall",
                      val: suitabilityData.rainfall,
                      unit: "mm/yr",
                      icon: CloudRain,
                      color: "text-blue-600",
                      bg: "bg-blue-50/50",
                    },
                    {
                      label: "Humidity",
                      val: suitabilityData.humidity,
                      unit: "%",
                      icon: Droplets,
                      color: "text-cyan-600",
                      bg: "bg-cyan-50/50",
                    },
                    {
                      label: "Temperature",
                      val: suitabilityData.temperature,
                      unit: "°C",
                      icon: Thermometer,
                      color: "text-orange-600",
                      bg: "bg-orange-50/50",
                    },
                    {
                      label: "Elevation",
                      val: suitabilityData.elevation,
                      unit: "m",
                      icon: Mountain,
                      color: "text-amber-600",
                      bg: "bg-amber-50/50",
                    },
                  ].map((metric, i) => (
                    <div
                      key={i}
                      className={`${metric.bg} border border-slate-100 rounded-xl p-3 flex flex-col justify-between`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {metric.label}
                        </span>
                        <metric.icon size={14} className={metric.color} />
                      </div>
                      <p className="text-lg font-black text-slate-800 tracking-tight">
                        {metric.val}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          {metric.unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT WORKSPACE SIDEBAR COLUMN ================= */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* MODEL MATCHING OUTPUT COMPONENT */}
              {suitabilityData && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                      Optimized Classification Target
                    </h4>
                    <div className="bg-green-50 border border-green-100 p-3.5 rounded-xl flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm border border-green-100">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-green-600 tracking-wide">
                          Primary Target Match
                        </p>
                        <p className="text-sm font-extrabold text-slate-800">
                          {suitabilityData.recommended_crop}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Relative Probability Distribution List */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                      Suitability Probability Curve
                    </h4>
                    <div className="space-y-2.5">
                      {Object.entries(suitabilityData.suitability_scores).map(
                        ([crop, score]) => (
                          <div key={crop} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                {crop}
                              </span>
                              <span className="font-mono text-[11px] font-bold">
                                {score}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Core Status Block & Model Metadata Footer */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
                  <Activity size={14} className="text-green-600" />
                  <span>3D Terrain Profiler Live</span>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Use the map view switch to adjust the elevation mesh layer.
                  Click anywhere on the matrix array to compute dynamic regional
                  adaptation parameters.
                </p>
              </div>

              {/* Technical Model Metadata HUD info */}
              {suitabilityData && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 px-1 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1">
                    <Cpu size={12} /> {suitabilityData.model_used}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Cache:{" "}
                    {suitabilityData.cached ? "HIT" : "MISS"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {activeTab === "prices" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* LEFT CONFIG PANEL */}
          <div className="xl:col-span-3">
            <div className="sticky top-6 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                    Forecast Engine
                  </span>

                  <h3 className="mt-1 text-lg font-black text-slate-800">
                    Commodity Configuration
                  </h3>
                </div>

                {/* CROP */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500">
                    Commodity
                  </label>

                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-emerald-500"
                  >
                    {CROPS.map((crop) => (
                      <option key={crop.name} value={crop.name}>
                        {crop.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DURATION */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500">
                    Forecast Horizon
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <select
                      value={durationType}
                      onChange={(e) => setDurationType(e.target.value)}
                      className="rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                    >
                      {allowedDurationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ACTION */}
                <button
                  onClick={fetchForecast}
                  disabled={loadingForecast}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingForecast ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Forecast
                    </>
                  )}
                </button>
              </div>

              {/* ENGINE INFO */}
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-emerald-700">
                  <Activity size={14} />
                  Predictive Engine
                </div>

                <p className="text-xs leading-relaxed text-emerald-700/80">
                  Multi-tier ARIMA commodity forecasting powered by localized
                  agricultural telemetry and regional volatility indexing.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="xl:col-span-9">
            {!forecastData ? (
              <div className="flex h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center">
                <div className="rounded-3xl bg-emerald-100 p-5">
                  <TrendingUp size={40} className="text-emerald-600" />
                </div>

                <h2 className="mt-6 text-2xl font-black text-slate-800">
                  Generate Market Intelligence
                </h2>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                  Configure a commodity forecast to visualize projected
                  agricultural price movement trends across future market
                  periods.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* TOP METADATA */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-100 p-3">
                          <TrendingUp size={22} className="text-emerald-600" />
                        </div>

                        <div>
                          <h2 className="text-2xl font-black capitalize text-slate-800">
                            {forecastData.crop} Forecast
                          </h2>

                          <p className="text-sm text-slate-500">
                            Forecast Period:
                            <strong className="ml-1 text-slate-700">
                              {forecastData.forecast_period}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">
                        Model: {forecastData.model_used}
                      </div>

                      <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700">
                        Tier: {forecastData.subscription_tier}
                      </div>

                      <div className="rounded-2xl bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700">
                        MAPE: {forecastData.accuracy.mape}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHART */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-slate-800">
                      Price Projection Trend
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Confidence interval visualization of predicted commodity
                      market movement.
                    </p>
                  </div>

                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={forecastData.predictions}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="forecastFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.35}
                            />

                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />

                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value) => `${value} XAF`}
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius: 16,
                            border: "1px solid #e2e8f0",
                          }}
                        />

                        <Legend />

                        <Area
                          type="monotone"
                          dataKey="upper_ci"
                          stroke="#cbd5e1"
                          fillOpacity={0}
                          name="Upper CI"
                        />

                        <Area
                          type="monotone"
                          dataKey="lower_ci"
                          stroke="#cbd5e1"
                          fillOpacity={0}
                          name="Lower CI"
                        />

                        <Area
                          type="monotone"
                          dataKey="price_xaf"
                          stroke="#10b981"
                          fill="url(#forecastFill)"
                          strokeWidth={3}
                          name="Predicted Price"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* METRICS */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      RMSE
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {forecastData.accuracy.rmse}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      MAPE
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {forecastData.accuracy.mape}%
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Forecast Bias
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {forecastData.accuracy.forecast_bias}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Generated
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Calendar size={14} />

                      {new Date(forecastData.generated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "yield" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* SIDEBAR */}
          <div className="xl:col-span-3">
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                    Yield Intelligence
                  </span>

                  <h2 className="mt-1 text-xl font-black text-slate-800">
                    Prediction Configuration
                  </h2>
                </div>

                {/* CROP */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500">
                    Crop Type
                  </label>

                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500"
                  >
                    {CROPS.map((crop) => (
                      <option key={crop.name} value={crop.name}>
                        {crop.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* FERTILIZER */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500">
                    Fertilizer Type
                  </label>

                  <select
                    value={fertilizerType}
                    onChange={(e) => setFertilizerType(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="organic">Organic</option>

                    <option value="chemical">Chemical</option>

                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                {/* IRRIGATION */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Irrigation
                    </p>

                    <p className="text-xs text-slate-500">
                      Artificial water supply
                    </p>
                  </div>

                  <button
                    onClick={() => setIrrigation(!irrigation)}
                    className={`relative h-7 w-14 rounded-full transition ${
                      irrigation ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        irrigation ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* LAND SIZE */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-emerald-700">
                      Selected Land Size
                    </span>

                    <span className="text-xl font-black text-emerald-700">
                      {globalLandSize.toFixed(2)} ha
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-emerald-700/80">
                    Draw your agricultural area directly on the map to
                    automatically compute land size.
                  </p>
                </div>

                {/* ACTION */}
                <button
                  onClick={fetchYieldPrediction}
                  disabled={loadingYield || !selectedLocation}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loadingYield ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Predict Yield
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div className="space-y-6 xl:col-span-9">
            {/* MAP */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-black text-slate-800">
                  Agricultural Land Mapping
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Select a location and outline the farmland polygon to
                  calculate land area automatically.
                </p>
              </div>

              <div className="h-[600px]">
                <Map
                  mapType={mapMode || "satellite"}
                  selectedLocation={selectedLocation}
                  onSelect={(location) => {
                    setSelectedLocation(location);
                  }}
                />
              </div>
            </div>

            {/* RESULTS */}
            {yieldPrediction && (
              <div className="space-y-6">
                {/* HEADER */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-emerald-100 p-4">
                        <Sprout size={24} className="text-emerald-700" />
                      </div>

                      <div>
                        <h2 className="text-2xl font-black capitalize text-slate-800">
                          {yieldPrediction.crop} Yield Prediction
                        </h2>

                        <p className="text-sm text-slate-500">
                          ML Predicted agronomic productivity analysis
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">
                        Model: {yieldPrediction.model_used}
                      </div>

                      <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700">
                        Confidence:{" "}
                        {(yieldPrediction.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* METRICS */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Total Yield
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {yieldPrediction.total_yield_tons.toFixed(2)}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">Tons</div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Yield / Hectare
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {yieldPrediction.yield_per_hectare.toFixed(2)}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">Tons / ha</div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      R² Score
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {yieldPrediction.metrics.r2_score.toFixed(2)}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      MAPE
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {yieldPrediction.metrics.mape.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* STATS BAR */}
          {historyData && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  label: "Total Activities",
                  value: historyData.total_activities,
                  icon: <Database size={16} />,
                  color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                },
                {
                  label: "Yield Predictions",
                  value: historyData.history.filter(
                    (h) => h.analysis_type === "yield_predictions",
                  ).length,
                  icon: <Sprout size={16} />,
                  color: "text-blue-600 bg-blue-50 border-blue-100",
                },
                {
                  label: "Price Forecasts",
                  value: historyData.history.filter(
                    (h) => h.analysis_type === "forecasts",
                  ).length,
                  icon: <TrendingUp size={16} />,
                  color: "text-violet-600 bg-violet-50 border-violet-100",
                },
                {
                  label: "Cache Hits",
                  value: historyData.history.filter((h) => h.is_cached_hit)
                    .length,
                  icon: <Zap size={16} />,
                  color: "text-amber-600 bg-amber-50 border-amber-100",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border p-4 bg-white shadow-sm flex items-center gap-4`}
                >
                  <div className={`rounded-xl p-2 border ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800">
                      {stat.value}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TIMELINE */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Activity Timeline
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  All analysis requests ordered by most recent.
                </p>
              </div>
              <button
                onClick={fetchHistory}
                disabled={loadingHistory}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                {loadingHistory ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Clock size={13} />
                )}
                Refresh
              </button>
            </div>

            {loadingHistory ? (
              <div className="flex h-64 items-center justify-center gap-3 text-slate-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-sm font-medium">
                  Loading activity history...
                </span>
              </div>
            ) : !historyData || historyData.history.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center px-6">
                <div className="rounded-3xl bg-slate-100 p-5 mb-4">
                  <Clock size={32} className="text-slate-400" />
                </div>
                <h4 className="font-black text-slate-700">No Activity Yet</h4>
                <p className="mt-1 text-sm text-slate-400">
                  Your analysis history will appear here once you run your first
                  request.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {historyData.history.map((item: any) => {
                  const typeConfig: Record<
                    string,
                    { label: string; color: string; icon: React.ReactNode }
                  > = {
                    yield_predictions: {
                      label: "Yield Prediction",
                      color: "bg-blue-100 text-blue-700",
                      icon: <Sprout size={14} />,
                    },
                    forecasts: {
                      label: "Price Forecast",
                      color: "bg-violet-100 text-violet-700",
                      icon: <TrendingUp size={14} />,
                    },
                    suitability_results: {
                      label: "Crop Suitability",
                      color: "bg-emerald-100 text-emerald-700",
                      icon: <MapPin size={14} />,
                    },
                    risk_scores: {
                      label: "Risk Score",
                      color: "bg-rose-100 text-rose-700",
                      icon: <BarChart3 size={14} />,
                    },
                  };
                  const config = typeConfig[item.analysis_type] ?? {
                    label: item.analysis_type,
                    color: "bg-slate-100 text-slate-600",
                    icon: <Database size={14} />,
                  };

                  return (
                    <div
                      key={item.request_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start gap-4">
                        {/* TYPE BADGE */}
                        <div
                          className={`mt-0.5 flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${config.color}`}
                        >
                          {config.icon}
                          {config.label}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold capitalize text-slate-800">
                              {item.crop}
                            </span>
                            {item.is_cached_hit && (
                              <span className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                                <Zap size={10} /> Cached
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.summary}
                          </p>

                          {/* META PILLS */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(item.meta).map(([key, val]) => (
                              <span
                                key={key}
                                className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                              >
                                {key.replace(/_/g, " ")}:{" "}
                                {Array.isArray(val)
                                  ? val.join(", ")
                                  : String(val)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* TIMESTAMP */}
                      <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400 sm:flex-col sm:items-end sm:gap-0.5">
                        <CheckCircle
                          size={12}
                          className="text-emerald-400 sm:hidden"
                        />
                        <span className="font-semibold text-slate-600">
                          {new Date(item.created_at).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </span>
                        <span>
                          {new Date(item.created_at).toLocaleTimeString(
                            "en-GB",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {generatedReports[item.result_id] ? (
                          <button
                            onClick={() =>
                              downloadReport(
                                generatedReports[item.result_id].report_id,
                                generatedReports[item.result_id].format,
                              )
                            }
                            className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                          >
                            <Download size={12} />
                            Download{" "}
                            {generatedReports[
                              item.result_id
                            ].format.toUpperCase()}
                          </button>
                        ) : (
                          <>
                            {/* FORMAT PICKER */}
                            <select
                              value={reportFormats[item.result_id] ?? "json"}
                              onChange={(e) =>
                                setReportFormats((prev) => ({
                                  ...prev,
                                  [item.result_id]: e.target.value as
                                    | "json"
                                    | "pdf",
                                }))
                              }
                              disabled={generatingReports[item.result_id]}
                              className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-emerald-500 disabled:opacity-50"
                            >
                              <option value="json">JSON</option>
                              <option value="pdf">PDF</option>
                            </select>

                            <button
                              onClick={() =>
                                generateReport(
                                  item.analysis_type,
                                  item.result_id,
                                )
                              }
                              disabled={generatingReports[item.result_id]}
                              className="flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                            >
                              {generatingReports[item.result_id] ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />{" "}
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <FileText size={12} /> Generate Report
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* HEADER ROW */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-800">
                Generated Reports
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                All reports you have generated, ready to download.
              </p>
            </div>
            <button
              onClick={fetchMyReports}
              disabled={loadingMyReports}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 shadow-sm"
            >
              {loadingMyReports ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Clock size={13} />
              )}
              Refresh
            </button>
          </div>

          {/* REPORTS LIST */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {loadingMyReports ? (
              <div className="flex h-64 items-center justify-center gap-3 text-slate-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-sm font-medium">Fetching reports...</span>
              </div>
            ) : !myReports || myReports.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center px-6">
                <div className="rounded-3xl bg-slate-100 p-5 mb-4">
                  <FileClock size={32} className="text-slate-400" />
                </div>
                <h4 className="font-black text-slate-700">No Reports Yet</h4>
                <p className="mt-1 text-sm text-slate-400">
                  Go to your activity history and generate a report for any
                  analysis.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {(myReports ?? [])
                  .filter((report) => report.report_id)
                  .map((report) => {
                    const typeLabels: Record<string, string> = {
                      yield_prediction: "Yield Prediction",
                      price_forecast: "Price Forecast",
                      crop_suitability: "Crop Suitability",
                      risk_score: "Risk Score",
                    };
                    const label =
                      typeLabels[report.report_type ?? ""] ??
                      report.report_type ??
                      "Report";

                    return (
                      <div
                        key={report.report_id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-start gap-4">
                          {/* ICON */}
                          <div className="mt-0.5 rounded-2xl bg-slate-100 p-2.5 text-slate-500">
                            <FileText size={18} />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-800">
                                {label}
                              </span>
                              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                {report.format}
                              </span>
                              {report.is_ready ? (
                                <span className="flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                  <CheckCircle2 size={10} /> Ready
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                                  <HourglassIcon size={10} /> Processing
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                              ID: {report.report_id}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {new Date(report.created_at).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}{" "}
                              at{" "}
                              {new Date(report.created_at).toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        {/* DOWNLOAD */}
                        <button
                          onClick={() =>
                            downloadReport(report.report_id, report.format)
                          }
                          disabled={!report.is_ready && !downloadingReport}
                          className="flex shrink-0 items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {downloadingReport ? (
                            <div className="flex shrink-0 items-center gap-2">
                              {" "}
                              <Loader2
                                size={22}
                                className="animate-spin"
                              />{" "}
                              Downloading{" "}
                            </div>
                          ) : (
                            <div className="flex shrink-0 items-center gap-2">
                              {" "}
                              <Download size={13} /> Download{" "}
                              {report.format.toUpperCase()}
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "risk" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* SIDEBAR */}
          <div className="xl:col-span-3">
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">
                  Risk Engine
                </span>
                <h2 className="mt-1 text-xl font-black text-slate-800">
                  Risk Configuration
                </h2>
              </div>

              {/* CROP */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-slate-500">
                  Crop Type
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-rose-500"
                >
                  {CROPS.map((crop) => (
                    <option key={crop.name} value={crop.name}>
                      {crop.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* MARKET ACCESS */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-slate-500">
                  Market Access
                </label>
                <select
                  value={marketAccess}
                  onChange={(e) => setMarketAccess(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-rose-500"
                >
                  <option value="poor">Poor</option>
                  <option value="moderate">Moderate</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>

              {/* LAND SIZE */}
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-rose-700">
                    Land Size
                  </span>
                  <span className="text-xl font-black text-rose-700">
                    {globalLandSize.toFixed(2)} ha
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-rose-700/80">
                  Drawn from your map selection on the yield tab.
                </p>
              </div>

              {/* ACTION */}
              <button
                onClick={fetchRisk}
                disabled={loadingRisk || !selectedLocation}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-500 transition disabled:opacity-50"
              >
                {loadingRisk ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Analysing...
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} /> Assess Risk
                  </>
                )}
              </button>

              {/* INFO BOX */}
              <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-rose-700">
                  <Activity size={14} /> Risk Engine
                </div>
                <p className="text-xs leading-relaxed text-rose-700/80">
                  Composite risk scoring across climate, financial, and
                  agronomic dimensions using regional telemetry data.
                </p>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="space-y-6 xl:col-span-9">
            {/* MAP */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-black text-slate-800">
                  Location Selection
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Select a location to compute region-specific risk parameters.
                </p>
              </div>
              <div className="h-[350px]">
                <Map
                  mapType="satellite"
                  selectedLocation={selectedLocation}
                  onSelect={(location) => setSelectedLocation(location)}
                />
              </div>
            </div>

            {!riskData ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center">
                <div className="rounded-3xl bg-rose-100 p-5 mb-4">
                  <ShieldAlert size={36} className="text-rose-500" />
                </div>
                <h4 className="font-black text-slate-700">
                  No Risk Assessment Yet
                </h4>
                <p className="mt-1 text-sm text-slate-400 max-w-sm">
                  Configure the parameters and click Assess Risk to compute a
                  composite agricultural risk score.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* RISK HEADER */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-2xl p-4 ${
                          riskData.risk_level === "low"
                            ? "bg-emerald-100"
                            : riskData.risk_level === "medium"
                              ? "bg-amber-100"
                              : "bg-rose-100"
                        }`}
                      >
                        {riskData.risk_level === "low" ? (
                          <ShieldCheck size={24} className="text-emerald-600" />
                        ) : riskData.risk_level === "medium" ? (
                          <ShieldAlert size={24} className="text-amber-600" />
                        ) : (
                          <ShieldX size={24} className="text-rose-600" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black capitalize text-slate-800">
                          {riskData.region} —{" "}
                          {riskData.risk_level.toUpperCase()} Risk
                        </h2>
                        <p className="text-sm text-slate-500">
                          Overall score:{" "}
                          <strong className="text-slate-700">
                            {(riskData.overall_risk_score * 100).toFixed(1)}%
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">
                        Tier: {riskData.subscription_tier}
                      </div>
                      <div className="rounded-2xl bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700">
                        F1: {riskData.metrics.f1_score.toFixed(2)}
                      </div>
                      <div className="rounded-2xl bg-violet-100 px-4 py-2 text-xs font-bold text-violet-700">
                        RMSE: {riskData.metrics.rmse.toFixed(2)}
                      </div>
                      {riskData.cached && (
                        <div className="flex items-center gap-1 rounded-2xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-700">
                          <Zap size={11} /> Cached
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RISK SCORE BARS */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    {
                      label: "Financial Risk",
                      value: riskData.financial_risk,
                      color: "bg-rose-500",
                      track: "bg-rose-100",
                    },
                    {
                      label: "Climate Risk",
                      value: riskData.climate_risk,
                      color: "bg-amber-500",
                      track: "bg-amber-100",
                    },
                    {
                      label: "Agronomic Risk",
                      value: riskData.agronomic_risk,
                      color: "bg-violet-500",
                      track: "bg-violet-100",
                    },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {r.label}
                        </span>
                        <span className="text-lg font-black text-slate-800">
                          {(r.value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full ${r.track}`}>
                        <div
                          className={`h-2.5 rounded-full ${r.color} transition-all duration-700`}
                          style={{ width: `${r.value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* RISK FACTORS + RECOMMENDATIONS */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* RISK FACTORS */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-rose-100 p-2">
                        <AlertTriangle size={16} className="text-rose-600" />
                      </div>
                      <h3 className="font-black text-slate-800">
                        Risk Factors
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {riskData.risk_factors.map((factor, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* RECOMMENDATIONS */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-emerald-100 p-2">
                        <Lightbulb size={16} className="text-emerald-600" />
                      </div>
                      <h3 className="font-black text-slate-800">
                        Recommendations
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {riskData.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* GENERATED AT */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={12} />
                  Generated:{" "}
                  {new Date(riskData.generated_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
