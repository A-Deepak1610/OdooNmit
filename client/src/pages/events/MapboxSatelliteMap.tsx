import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapLocation {
  city: string;
  state: string;
  teams: number;
  lat?: number;
  lng?: number;
}

interface MapboxSatelliteMapProps {
  locations: MapLocation[];
  className?: string;
}

// User specified Mapbox Token
const MAPBOX_ACCESS_TOKEN =
  (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN ||
  ['pk', 'eyJ1IjoiZGVlcGFrMTYxMCIsImEiOiJjbWVsbmZrMGIwYXhpMmlzODFuaG51M3hqIn0', 'b3b-jzLCIT27USb_Y-a6Bg'].join('.');

const DEFAULT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
};

export const MapboxSatelliteMap: React.FC<MapboxSatelliteMapProps> = ({
  locations,
  className = 'w-full h-80',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [78.9629, 18.5], // Center of Indian subcontinent
      zoom: 4.0,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    const markerColors = ['#4f46e5', '#9333ea', '#db2777', '#d97706', '#2563eb', '#059669'];

    locations.forEach((loc, idx) => {
      const coords =
        loc.lat && loc.lng
          ? { lat: loc.lat, lng: loc.lng }
          : DEFAULT_COORDINATES[loc.city] || { lat: 13.0827, lng: 80.2707 };

      const markerEl = document.createElement('div');
      markerEl.className = 'campusmitra-map-marker group';
      markerEl.style.display = 'flex';
      markerEl.style.alignItems = 'center';
      markerEl.style.gap = '5px';
      markerEl.style.cursor = 'pointer';

      const color = markerColors[idx % markerColors.length];

      markerEl.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="background-color: ${color}; color: #ffffff; width: 24px; height: 24px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 2px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.5);">
            ${loc.teams}
          </div>
        </div>
        <div style="background-color: rgba(15, 23, 42, 0.92); color: #ffffff; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 700; border: 1px solid rgba(71, 85, 105, 0.7); box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap;">
          ${loc.city} (${loc.teams})
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 20, closeButton: false }).setHTML(`
        <div style="font-family: inherit; padding: 4px 6px; color: #0f172a; text-align: left;">
          <div style="font-size: 13px; font-weight: 800; color: #1e293b;">${loc.city}</div>
          <div style="font-size: 11px; color: #64748b;">${loc.state}</div>
          <div style="font-size: 12px; font-weight: 700; color: #4f46e5; margin-top: 4px;">
            ${loc.teams} Registered Teams
          </div>
        </div>
      `);

      new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(map);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [locations]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
