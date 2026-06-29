'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

// Custom icons based on status/category using L.divIcon
const getMarkerIcon = (status, category) => {
  let color = '#f59e0b'; // amber (reported)
  
  switch (status) {
    case 'reported':
      color = '#f59e0b'; // amber
      break;
    case 'ai_verified':
      color = '#3b82f6'; // blue
      break;
    case 'citizen_verified':
      color = '#8b5cf6'; // purple
      break;
    case 'assigned':
      color = '#f97316'; // orange
      break;
    case 'in_progress':
      color = '#eab308'; // yellow
      break;
    case 'resolved':
      color = '#10b981'; // emerald
      break;
    case 'closed':
      color = '#6b7280'; // gray
      break;
  }

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 rounded-full animate-ping opacity-75" style="background-color: ${color}; animation-duration: 3s;"></div>
        <div class="relative w-4.5 h-4.5 rounded-full border border-white/50 shadow-md flex items-center justify-center" style="background-color: ${color};">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// View updater subcomponent to handle dynamic panning
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function LeafletMap({ 
  issues = [], 
  center = [40.730610, -73.935242], // New York center
  zoom = 12,
  onMapClick = null,
  showHeatmap = false,
  interactive = true 
}) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Fix leaflet default icon path bugs in Next.js compiled outputs
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-full bg-zinc-900/40 rounded-xl flex items-center justify-center border border-zinc-800">
        <span className="text-zinc-500 text-sm">Loading map viewport...</span>
      </div>
    );
  }

  // Click Handler component using direct react-leaflet hook
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (onMapClick) {
          onMapClick({
            lat: e.latlng.lat,
            lng: e.latlng.lng
          });
        }
      }
    });
    return null;
  };

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      className="w-full h-full min-h-[400px] z-10"
      zoomControl={interactive}
      scrollWheelZoom={interactive}
      dragging={interactive}
    >
      <ChangeView center={center} />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {onMapClick && <MapClickHandler />}

      {/* Render active selector marker if in map-click / report mode */}
      {onMapClick && (
        <Marker position={center} icon={getMarkerIcon('reported', 'Others')}>
          <Popup>
            <div className="text-[10px] font-bold p-1 text-zinc-200">Selected Problem Spot</div>
          </Popup>
        </Marker>
      )}

      {/* Render Heatmap circles if selected */}
      {showHeatmap && issues.map((issue) => {
        let color = '#ef4444'; // default red
        if (issue.severity === 'medium') color = '#eab308';
        if (issue.severity === 'low') color = '#3b82f6';
        if (issue.severity === 'critical') color = '#dc2626';

        return (
          <Circle
            key={`heat-${issue.id}`}
            center={[issue.location.latitude, issue.location.longitude]}
            radius={250}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.25,
              color: 'transparent',
              weight: 0
            }}
          />
        );
      })}

      {/* Render normal markers if heatmap is NOT shown */}
      {!showHeatmap && issues.map((issue) => (
        <Marker
          key={issue.id}
          position={[issue.location.latitude, issue.location.longitude]}
          icon={getMarkerIcon(issue.status, issue.category)}
        >
          <Popup className="custom-popup">
            <div className="p-1 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                  {issue.category}
                </span>
                <span className="text-[9px] text-zinc-400 capitalize">
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              <h4 className="text-xs font-bold text-zinc-100 leading-tight">
                {issue.title}
              </h4>
              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                {issue.description}
              </p>
              <div className="text-[9px] text-zinc-500 italic truncate">
                📍 {issue.address}
              </div>
              
              {interactive && (
                <Link
                  href={`/citizen/dashboard?issueId=${issue.id}`}
                  className="block text-center text-[10px] bg-emerald-500 text-black py-1 rounded font-bold hover:bg-emerald-400 mt-2 transition-all"
                >
                  View Details & Vote
                </Link>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
