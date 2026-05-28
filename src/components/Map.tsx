import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";

import {
  MapPin,
  Layers3,
  Navigation,
  Pencil,
  Trash2,
} from "lucide-react";

import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useAuth } from "@/context/AuthContext";

interface LocationPayload {
  lat: number;
  lng: number;
  name: string;
}

interface MapProps {
  onSelect: (location: LocationPayload) => void;
  selectedLocation: LocationPayload | null;
  mapType?: "satellite" | "terrain";
  onLandAreaComputed?: (hectares: number) => void;
}

export const Map: React.FC<MapProps> = ({
  onSelect,
  selectedLocation,
  mapType = "satellite",
  onLandAreaComputed,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
const { setGlobalLandSize } = useAuth();
  const [is3DMode, setIs3DMode] = useState<boolean>(mapType === "terrain");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [landArea, setLandArea] = useState<number>(0);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);

  const defaultCenter: [number, number] = [12.3547, 7.3697];

  const getMapStyleSpecification = (type: "satellite" | "terrain") => {
    const tileSource =
      type === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    return {
      version: 8 as const,
      sources: {
        "base-raster-tiles": {
          type: "raster" as const,
          tiles: [tileSource],
          tileSize: 256,
        },
        "terrain-rgb-elevation": {
          type: "raster-dem" as const,
          tiles: ["https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "base-layer",
          type: "raster" as const,
          source: "base-raster-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  };

  const requestUserLocationMatrix = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          speed: 1.0,
          essential: true,
        });

        onSelect({
          lat: latitude,
          lng: longitude,
          name: `Current Position (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`,
        });

        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
      }
    );
  };
  const startDrawingPolygon = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop click from bleeding into map selection click handling
    if (!drawRef.current) return;
    
    // Trigger MapboxDraw Draw Polygon Mode
    drawRef.current.changeMode("draw_polygon");
    setIsDrawingMode(true);
  };

  const clearDrawnShapes = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!drawRef.current) return;

    drawRef.current.deleteAll();
    setLandArea(0);
    onLandAreaComputed?.(0);
    setIsDrawingMode(false);
  };

  const calculatePolygonArea = () => {
    if (!drawRef.current) return;

    const data = drawRef.current.getAll();
    if (!data.features.length) {
      setLandArea(0);
      onLandAreaComputed?.(0);
      return;
    }

    const polygon = data.features.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (feature: any) => feature.geometry.type === "Polygon"
    );

    if (!polygon) return;

    const areaSqMeters = turf.area(polygon);
    const hectares = areaSqMeters / 10000;

    setLandArea(hectares);
    setGlobalLandSize(hectares);
    onLandAreaComputed?.(hectares);
  };
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialStyle = getMapStyleSpecification(mapType);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: defaultCenter,
      zoom: 5.5,
      pitch: is3DMode ? 55 : 0,
      bearing: is3DMode ? -15 : 0,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true }),
      "top-right"
    );

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      styles: [
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"]],
          paint: {
            "fill-color": "#10b981",
            "fill-opacity": 0.18,
          },
        },
        {
          id: "gl-draw-polygon-stroke",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#10b981",
            "line-width": 3,
          },
        },
        // IMPORTANT: Styles for vertex points so the operator knows where to click/drag anchors
        {
          id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
          type: "circle",
          filter: ["all", ["==", "meta", "vertex"], ["!=", "active", "true"]],
          paint: {
            "circle-radius": 5,
            "circle-color": "#fff",
            "circle-stroke-color": "#10b981",
            "circle-stroke-width": 2,
          },
        },
        {
          id: "gl-draw-polygon-and-line-vertex-inactive",
          type: "circle",
          filter: ["all", ["==", "meta", "vertex"], ["!=", "active", "true"]],
          paint: {
            "circle-radius": 3,
            "circle-color": "#10b981",
          },
        },
      ],
    });

    drawRef.current = draw;
    map.addControl(draw);

    map.on("draw.create", () => {
      calculatePolygonArea();
      setIsDrawingMode(false);
    });

    map.on("draw.update", calculatePolygonArea);
    
    map.on("draw.delete", () => {
      setLandArea(0);
      onLandAreaComputed?.(0);
      setIsDrawingMode(false);
    });

    // Safely reset drawing tracking if user exits action early
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on("draw.modechange", (e: any) => {
      if (e.mode !== "draw_polygon") {
        setIsDrawingMode(false);
      }
    });

    map.on("load", () => {
      if (!mapRef.current) return;
      mapRef.current.setTerrain({
        source: "terrain-rgb-elevation",
        exaggeration: 1.5,
      });
      requestUserLocationMatrix();
    });

    map.on("click", (e) => {
      // Prevent mapping coordinates point marker drops if user is in drawing mode!
      if (drawRef.current && drawRef.current.getMode() === "draw_polygon") {
        return;
      }

      onSelect({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
        name: `Plot Location (${e.lngLat.lat.toFixed(4)}°N, ${e.lngLat.lng.toFixed(4)}°E)`,
      });
    });

    const element = mapContainerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updatedStyle = getMapStyleSpecification(mapType);
    map.setStyle(updatedStyle);

    const target3DState = mapType === "terrain";
    setIs3DMode(target3DState);

    map.easeTo({
      pitch: target3DState ? 55 : 0,
      bearing: target3DState ? -15 : 0,
      duration: 400,
    });

    map.once("style.load", () => {
      map.setTerrain({
        source: "terrain-rgb-elevation",
        exaggeration: 1.5,
      });
    });
  }, [mapType]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;

    map.flyTo({
      center: [selectedLocation.lng, selectedLocation.lat],
      zoom: 12.5,
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const el = document.createElement("div");
    el.className = "relative flex items-center justify-center";
    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 bg-green-500 rounded-full opacity-25 animate-ping"></div>
        <div class="absolute w-8 h-8 bg-green-500 rounded-full opacity-35 animate-pulse"></div>
        <div class="relative w-5 h-5 bg-green-600 rounded-full border-2 border-white shadow-[0_0_12px_rgba(22,163,74,0.6)] flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `;

    const nextMarker = new maplibregl.Marker({ element: el })
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .addTo(map);

    markerRef.current = nextMarker;
  }, [selectedLocation]);

  const togglePerspectiveViewProjection = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!is3DMode) {
      map.easeTo({ pitch: 55, bearing: -15, duration: 800 });
      setIs3DMode(true);
    } else {
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
      setIs3DMode(false);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
      
      {/* HEADER PANELS */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-2">
        {selectedLocation && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-900/90 px-3 py-1.5 text-[11px] font-medium text-slate-100 backdrop-blur-sm">
            <MapPin size={12} className="text-green-400" />
            <span className="max-w-[240px] truncate font-mono">
              {selectedLocation.name}
            </span>
          </div>
        )}

        {landArea > 0 && (
          <div className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
            Plot Area: {landArea.toFixed(2)} ha
          </div>
        )}
      </div>

      {/* FIXED INTERACTIVE CONTROLS BELT */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center flex-wrap gap-2">
        
        <button
          type="button"
          onClick={togglePerspectiveViewProjection}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer ${
            is3DMode
              ? "border-green-700 bg-green-600 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Layers3 size={13} />
          <span>{is3DMode ? "3D View" : "2D View"}</span>
        </button>

        <button
          type="button"
          onClick={requestUserLocationMatrix}
          disabled={isLocating}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer hover:bg-slate-50"
        >
          <Navigation
            size={13}
            className={isLocating ? "animate-spin text-green-600" : "text-green-600"}
          />
          <span>{isLocating ? "Locating..." : "Find Position"}</span>
        </button>

        {/* REFACTORED TO REAL ACTIONABLE BUTTONS WITH CLICK HANDLERS */}
        <button
          type="button"
          onClick={startDrawingPolygon}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer ${
            isDrawingMode
              ? "border-emerald-600 bg-emerald-50 text-emerald-700 animate-pulse"
              : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          <Pencil size={12} />
          <span>{isDrawingMode ? "Click Map to Draw" : "Draw Polygon"}</span>
        </button>

        <button
          type="button"
          onClick={clearDrawnShapes}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-600 shadow-sm transition-all hover:bg-red-50 cursor-pointer"
        >
          <Trash2 size={12} />
          <span>Clear Shape</span>
        </button>
      </div>

      {/* MAP VIEWPORT container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full cursor-crosshair bg-slate-100"
      />
    </div>
  );
};