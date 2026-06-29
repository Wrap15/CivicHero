'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '12px'
};

// Premium dark mode theme styles for Google Maps
const darkMapOptions = {
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#18181b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#18181b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#71717a' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#e4e4e7' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#a1a1aa' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#27272a' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#52525b' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#27272a' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#18181b' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#71717a' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#3f3f46' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#18181b' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#e4e4e7' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#09090b' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#3f3f46' }]
    }
  ],
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

export default function GoogleMapView({ 
  issues = [], 
  center = [40.730610, -73.935242], // New York defaults
  zoom = 12,
  onMapClick = null,
  interactive = true 
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // Format center coords to Google's {lat, lng} object structure
  const formattedCenter = {
    lat: Number(center[0]) || 40.730610,
    lng: Number(center[1]) || -73.935242
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  const [map, setMap] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  // Update center camera dynamically when coordinates change
  useEffect(() => {
    if (map && center) {
      map.panTo(formattedCenter);
    }
  }, [center, map]);

  if (!apiKey) {
    return (
      <div className="w-full h-full min-h-[400px] bg-zinc-900/40 rounded-xl border border-zinc-800 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-zinc-500 text-xs max-w-xs leading-relaxed">
          📍 To connect Google Maps, configure <strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</strong> in your <code>.env.local</code> file and install <code>@react-google-maps/api</code>.
        </span>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[400px] bg-zinc-900/40 rounded-xl border border-zinc-800 flex items-center justify-center">
        <span className="text-zinc-550 text-xs animate-pulse">Loading Google Maps Engine...</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={formattedCenter}
      zoom={zoom}
      options={darkMapOptions}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={(e) => {
        if (onMapClick && interactive) {
          onMapClick({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          });
        }
      }}
    >
      {/* Click selector marker */}
      {onMapClick && (
        <Marker
          position={formattedCenter}
          title="Selected spot"
        />
      )}

      {/* Roster issue pins */}
      {!onMapClick && issues.map((issue) => (
        <Marker
          key={issue.id}
          position={{
            lat: Number(issue.location.latitude),
            lng: Number(issue.location.longitude)
          }}
          onClick={() => setSelectedIssue(issue)}
        />
      ))}

      {/* Dynamic Popups */}
      {selectedIssue && (
        <InfoWindow
          position={{
            lat: Number(selectedIssue.location.latitude),
            lng: Number(selectedIssue.location.longitude)
          }}
          onCloseClick={() => setSelectedIssue(null)}
        >
          <div className="p-1 text-black max-w-[180px]">
            <h4 className="text-xs font-bold leading-tight">{selectedIssue.title}</h4>
            <p className="text-[10px] text-gray-600 mt-1 line-clamp-2">{selectedIssue.description}</p>
            <span className="text-[9px] text-gray-400 block mt-1">📍 {selectedIssue.address}</span>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
