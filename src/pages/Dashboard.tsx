import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Calendar,
  Loader2,
  Radio,
  Sparkles,
  TrendingUp,
  Sprout,
} from "lucide-react";
import { Map as MapPicker } from "../components/MapPicker";
import { CROPS, type ForecastResponse } from "../types";
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
import { fetchYieldPrediction as YieldPrediction } from "../helper/requests/yieldprediction.request";
import { fetchForecast as forecast } from "../helper/requests/forecast.request";
import { useAuth } from "@/context/AuthContext";
import { sileo } from "sileo";

interface DashboardProps {
  mockMode: boolean;
  activeTab: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ activeTab }) => {
  // Focus initial geocentric coordinate targets perfectly center over Cameroon
  const [coords, setCoords] = useState({
    lat: 5.47,
    lon: 10.42,
    region: "West",
  });
  const { user } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState("maize");
  const [landSize, setLandSize] = useState(8);
  const [duration, setDuration] = useState(2);
  const [durationType, setDurationType] = useState("months");
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null,
  );
  const [fertilizerType, setFertilizerType] = useState("organic");
  const [irrigation, setIrrigation] = useState(false);
  const [loadingYield, setLoadingYield] = useState(false);
  const [yieldPrediction, setYieldPrediction] = useState<any>(null);
  const { globalLandSize } = useAuth();
  const [selectedLocation, setSelectedLocation] =
    useState<LocationPayload | null>(null);
  const allowedDurationTypes = useMemo(() => {
    const tier = user?.subscription_type || "free";
    if (tier === "premium") {
      return ["days", "weeks", "months"];
    }
    if (tier === "medium") {
      return ["weeks", "months"];
    }
    return ["months"];
  },[user?.subscription_type]);

  useEffect(() => {
    if (!allowedDurationTypes.includes(durationType)) {
      setDurationType(allowedDurationTypes[0]);
    }
  }, [allowedDurationTypes, durationType]);

  const fetchForecast = async () => {
    try {
      setLoadingForecast(true);
      const response = await forecast(duration, durationType, selectedCrop);
      setForecastData(response);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Encountered An Error Fetching Forecast",
        description: "Unable to fetch forecast data. Check Console for details.",
        duration: 3000, // Keeps the layout on screen for 3 seconds instead of the default 6
      });
    } finally {
      setLoadingForecast(false);
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
        description: "Unable to fetch yield prediction data. Check Console for details.",
        duration: 3000, // Keeps the layout on screen for 3 seconds instead of the default 6
      });
    } finally {
      setLoadingYield(false);
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
            {activeTab === "dashboard" && "Central Operations Workspace"}
            {activeTab === "suitability" &&
              "Geospatial Suitability Classification Map"}
          </h1>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 text-slate-600 shadow-sm">
            <Radio size={12} className="text-green-600 animate-pulse" />
            <span>
              Operational Cluster Node:{" "}
              <strong className="text-slate-900">{coords.region}</strong>
            </span>
          </div>
        </div>
      </div>

      {(activeTab === "dashboard" || activeTab === "suitability") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Geospatial Array Realtime Selection Raster Matrix
            </h3>
            <MapPicker
              lat={coords.lat}
              lon={coords.lon}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(lat: any, lon: any, regionName: any) =>
                setCoords({ lat, lon, region: regionName })
              }
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Workspace Configurations
              </h3>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">
                  Active Crop Focus
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none shadow-sm focus:border-green-500"
                >
                  {CROPS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Arable Surface Area</span>
                  <span className="text-green-600">{landSize} Hectares</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={landSize}
                  onChange={(e) => setLandSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

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
                  mapType="satellite"
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
                      {yieldPrediction.total_yield_tons}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">Tons</div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Yield / Hectare
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {yieldPrediction.yield_per_hectare}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">Tons / ha</div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      R² Score
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {yieldPrediction.metrics.r2_score}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      MAPE
                    </div>

                    <div className="mt-3 text-3xl font-black text-slate-800">
                      {yieldPrediction.metrics.mape}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
