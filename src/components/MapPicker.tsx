import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { MapPin, Layers3 } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

interface LocationPayload {
  lat: number;
  lng: number;
  name: string;
}

interface MapProps {
  onSelect: (location: LocationPayload) => void;
  selectedLocation: LocationPayload | null;
  mapType?: "satellite" | "terrain";
}

export const Map: React.FC<MapProps> = ({ 
  onSelect, 
  selectedLocation, 
  mapType = "satellite" 
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  
  const [is3DMode, setIs3DMode] = useState<boolean>(mapType === "terrain");

  // Default geocentric tracking baseline (Cameroon Center)
  const defaultCenter: [number, number] = [12.3547, 7.3697];

  const getMapStyleSpecification = (type: "satellite" | "terrain") => {
    const tileSource = type === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attributionString = type === "satellite"
      ? ""
      : "";

    return {
      version: 8 as const,
      sources: {
        "base-raster-tiles": {
          type: "raster" as const,
          tiles: [tileSource],
          tileSize: 256,
          attribution: attributionString,
        },
        "terrain-rgb-elevation": {
          type: "raster-dem" as const,
          tiles: ["https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png"],
          tileSize: 256,
        }
      },
      layers: [
        {
          id: "base-layer",
          type: "raster" as const,
          source: "base-raster-tiles",
          minzoom: 0,
          maxzoom: 19,
        }
      ]
    };
  };

  // Structural Runtime Hook: Query Core Browser Telemetry
  const requestUserLocationMatrix = () => {
    if (!navigator.geolocation || !mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Execute smooth fluid translation flight array directly onto target node coordinates
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          speed: 1.0,
          essential: true
        });

        // Broadcast current location parameters back up to the Parent Dashboard Matrix state
        onSelect({
          lat: latitude,
          lng: longitude,
          name: `User Current Matrix Reference (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`
        });
        
      },
      (error) => {
        console.warn("System Geolocation Intercept Failed or Denied. Maintaining standard spatial center matrix.", error);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Primary Initialization Loop with Geolocation Detection
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
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      if (!mapRef.current) return;
      mapRef.current.setTerrain({ source: "terrain-rgb-elevation", exaggeration: 1.5 });
      
      // Auto-trigger positioning payload extraction sequence immediately upon system launch
      requestUserLocationMatrix();
    });

    map.on("click", (e) => {
      onSelect({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
        name: `Plot Location (${e.lngLat.lat.toFixed(4)}°N, ${e.lngLat.lng.toFixed(4)}°E)`
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

  

  // Sync External Styles Selector Modifications
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
      duration: 400
    });

    map.once("style.load", () => {
      map.setTerrain({ source: "terrain-rgb-elevation", exaggeration: 1.5 });
    });
  }, [mapType]);

  // Sync Dynamic Changes on Selected Location State Changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;

    map.flyTo({
      center: [selectedLocation.lng, selectedLocation.lat],
      zoom: 12.5,
      speed: 1.2,
      curve: 1.4,
      essential: true
    });

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const el = document.createElement("div");
    el.className = "relative flex items-center justify-center cursor-pointer";
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
    <div className="w-full h-full relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm select-none">
      {/* Top Left Floating Header Diagnostics Context */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        {selectedLocation && (
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-100 shadow-sm">
            <MapPin size={12} className="text-green-400" />
            <span className="truncate max-w-[240px] font-mono">{selectedLocation.name}</span>
          </div>
        )}
      </div>

      {/* Floating Action Array: Perspective Switches + Force Position Retrieval Trigger */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={togglePerspectiveViewProjection}
          className={`px-1.5 py-0.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all duration-150 outline-none select-none ${
            is3DMode
              ? "bg-green-600 border-green-700 text-white shadow-md shadow-green-600/10"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Layers3 size={13} />
          <span>{is3DMode ? "3D" : "2D"}</span>
        </button>
      </div>

      {/* Primary WebGL Core Map Render target box */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full block bg-slate-100 cursor-crosshair"
      />
    </div>
  );
};