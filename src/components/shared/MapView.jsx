'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(
  () => import('./LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-zinc-900/40 rounded-xl flex items-center justify-center border border-zinc-800">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-500 text-xs">Loading geographic canvas...</span>
        </div>
      </div>
    )
  }
);

export default function MapView(props) {
  return <DynamicMap {...props} />;
}
