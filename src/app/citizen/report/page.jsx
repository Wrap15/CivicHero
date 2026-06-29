'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import MapView from '@/components/shared/MapView';
import VoiceRecorder from '@/components/shared/VoiceRecorder';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { issueService } from '@/services/issueService';
import { 
  Camera, 
  MapPin, 
  Sparkles, 
  Send, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Eye, 
  Volume2, 
  HelpCircle,
  Clock,
  Wrench,
  ShieldCheck
} from 'lucide-react';

export default function ReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Others');
  const [severity, setSeverity] = useState('medium');
  const [urgency, setUrgency] = useState('medium');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(40.758896); // Default NYC Times Sq
  const [longitude, setLongitude] = useState(-73.985130);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Media states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [audioData, setAudioData] = useState(null);
  
  // Status states
  const [scanning, setScanning] = useState(false);
  const [aiScanned, setAiScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Duplicate check states
  const [duplicateMatch, setDuplicateMatch] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Categories list
  const categories = [
    'Road Damage', 'Water Leakage', 'Streetlight', 'Garbage', 
    'Electric Hazard', 'Illegal Construction', 'Public Safety', 
    'Tree Fall', 'Drainage', 'Others'
  ];

  // Protect route
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Geolocation trigger
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat);
          setLongitude(lng);
          // Try to fetch address
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            setAddress(data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
          } catch (e) {
            setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
          }
        },
        (error) => {
          alert("Unable to retrieve location. Please select it on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Click on map to update location
  const handleMapClick = async (coords) => {
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
      const data = await res.json();
      setAddress(data.display_name || `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`);
    } catch (e) {
      setAddress(`Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`);
    }
  };

  // Image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Gemini AI vision scan
  const triggerAiScan = async () => {
    if (!imagePreview) {
      setError('Please upload a photo of the issue first.');
      return;
    }
    setError('');
    setScanning(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          transcript: audioData ? audioData.transcript : ''
        })
      });
      const result = await response.json();

      if (result.success && result.data) {
        const ai = result.data;
        
        if (ai.isSpam) {
          setError('AI Scan alert: The uploaded image does not appear to contain a valid public infrastructure issue. Please upload a clear photo.');
          setScanning(false);
          return;
        }

        setTitle(ai.title);
        setDescription(ai.description);
        setCategory(ai.category);
        setSeverity(ai.severity);
        setUrgency(ai.urgency || 'medium');
        setAiReport(ai);
        setAiScanned(true);
      } else {
        throw new Error(result.error || 'AI analysis failed');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to contact Gemini AI service. Reverting to manual entry.');
    } finally {
      setScanning(false);
    }
  };

  // Form submit
  const submitFormPayload = async () => {
    setSubmitting(true);
    try {
      // 1. Upload photo
      const uploadedImageUrl = await issueService.uploadFile(imageFile, 'issues');
      
      // 2. Upload audio if present
      let uploadedVoiceUrl = '';
      if (audioData && audioData.file) {
        uploadedVoiceUrl = await issueService.uploadFile(audioData.file, 'voices');
      } else if (audioData && audioData.url) {
        uploadedVoiceUrl = audioData.url;
      }

      // 3. Save report
      const issuePayload = {
        title,
        description,
        category,
        severity,
        urgency,
        latitude,
        longitude,
        address,
        imageUrl: uploadedImageUrl || 'https://images.unsplash.com/photo-1599740831146-80e6f87ad60b?auto=format&fit=crop&w=800&q=80',
        voiceUrl: uploadedVoiceUrl,
        isAnonymous,
        aiConfidence: aiReport ? aiReport.confidence : 0.85,
        aiAnalysis: aiReport || {
          isSpam: false,
          severity,
          confidence: 0.85,
          repairRecommendation: 'Manual inspection and schedule required.',
          estimatedResolutionDays: 5
        }
      };

      await issueService.createIssue(issuePayload, user);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/citizen/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!imagePreview) {
      setError('Please upload a photo of the defect.');
      return;
    }
    
    if (!address) {
      setError('Please specify a location or click Detect Location.');
      return;
    }

    // Check for proximity duplicate reports (100 meters)
    try {
      const duplicate = await issueService.findDuplicate(latitude, longitude, category);
      if (duplicate) {
        setDuplicateMatch(duplicate);
        setShowDuplicateModal(true);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([20, 50, 20]);
        }
        return;
      }
    } catch (err) {
      console.error('Proximity duplicate check error:', err);
    }

    await submitFormPayload();
  };

  const handleVoteExisting = async () => {
    if (!duplicateMatch || !user) return;
    setSubmitting(true);
    try {
      await issueService.voteIssue(duplicateMatch.id, 'confirm', user);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
      alert('Success! Your verification has been recorded. +15 XP earned.');
      router.push('/citizen/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to record verification vote.');
    } finally {
      setSubmitting(false);
      setShowDuplicateModal(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted!</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Thank you! Your issue has been logged and analyzed by Gemini. Nearby citizens have been notified to verify your report.
          </p>
          <span className="inline-flex items-center space-x-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <span>+50 XP Earned</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">{t('reportIssue')}</h1>
            <p className="text-zinc-500 text-xs mt-1">Upload a photo. Gemini AI will automatically categorize, write titles, and analyze severity.</p>
          </div>

          {user && user.trustScore >= 85 && (
            <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-xl flex items-start space-x-3 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent)]">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300">
                <span className="font-bold text-white block">Trusted Sentry Status Activated 🛡️</span>
                Your Civic Trust Score is <strong className="text-indigo-400">{user.trustScore}%</strong>. This report will be <strong className="text-emerald-400">auto-verified</strong> instantly upon submission, bypassing community consensus checks!
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Media Upload Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Image Input */}
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center min-h-[160px] text-center relative overflow-hidden">
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden group">
                    <img src={imagePreview} alt="Report Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <label className="px-3 py-1.5 bg-zinc-800 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors">
                        Change Photo
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-800 hover:border-emerald-500/40 rounded-lg cursor-pointer bg-zinc-950/20 hover:bg-zinc-950/40 transition-all">
                    <Camera className="w-8 h-8 text-zinc-600 mb-2" />
                    <span className="text-xs text-zinc-400 font-semibold">Upload Photo</span>
                    <span className="text-[10px] text-zinc-500 mt-1">Drag here or browse files</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Voice Note Input */}
              <VoiceRecorder onAudioRecorded={setAudioData} />

            </div>

            {/* AI Scan Trigger Button */}
            {imagePreview && !aiScanned && (
              <button
                type="button"
                onClick={triggerAiScan}
                disabled={scanning}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-sm rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini AI Analyzing Photo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('runAiScan')}</span>
                  </>
                )}
              </button>
            )}

            {/* AI Status Badge */}
            {aiScanned && (
              <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs text-zinc-300">
                  <span className="font-bold text-white block">Gemini AI Auto-Filled Details</span>
                  We've successfully classified your report as <strong className="text-emerald-400">{category}</strong> with severity <strong className="text-amber-400">{severity}</strong>. Please review the populated inputs below before submitting.
                </div>
              </div>
            )}

            {/* Text Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{t('title')}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken streetlight on Broadway"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{t('description')}</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide details about the issue. How long has it been there? Is it a public safety risk?"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{t('category')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{t('severity')}</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all capitalize"
                  >
                    <option value="low">Low (Cosmetic defect)</option>
                    <option value="medium">Medium (Moderate block/risk)</option>
                    <option value="high">High (Damages property/cars)</option>
                    <option value="critical">Critical (Life-threatening)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{t('urgency')}</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all capitalize"
                  >
                    <option value="low">Low (Fix within a week)</option>
                    <option value="medium">Medium (Fix in 2-3 days)</option>
                    <option value="high">High (Requires next-day action)</option>
                  </select>
                </div>
              </div>

              {/* Location Input Group */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-400">{t('pavementLocation')}</label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="flex items-center space-x-1.5 text-xs text-emerald-400 hover:underline bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t('detectGps')}</span>
                  </button>
                </div>
                
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Broadway & W 45th St, New York, NY"
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Anonymity */}
              <div className="flex items-center space-x-3 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4.5 h-4.5 accent-emerald-500 rounded border-zinc-800 bg-zinc-950"
                />
                <label htmlFor="anonymous" className="text-xs text-zinc-400 select-none">
                  <strong className="text-white">Report Anonymously</strong> (Your name will not appear next to this issue. You will still receive notifications and XP privately.)
                </label>
              </div>

            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/15 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading media & saving report...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('submitReport')}</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Map Preview Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-zinc-800 h-fit space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Geotag Adjuster</span>
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1">
                Drag or click on the map to pinpoint where the defect is located. Coordinates are captured automatically.
              </p>
            </div>
            
            <div className="w-full h-80 rounded-xl overflow-hidden border border-zinc-800 relative">
              <MapView 
                issues={[]} 
                center={[latitude, longitude]} 
                zoom={14}
                onMapClick={handleMapClick}
              />
              {/* Floating pin overlay */}
              <div className="absolute top-4 right-4 bg-zinc-950/80 px-2.5 py-1.5 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 z-20 font-mono">
                Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
              </div>
            </div>
          </div>

          {/* AI Tech Recommendation Panel */}
          {aiReport && (
            <div className="glass-panel p-5 rounded-2xl border border-zinc-800/80 space-y-3 bg-emerald-500/[0.01]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <Wrench className="w-4 h-4" />
                <span>AI Repair Analysis</span>
              </h3>
              
              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold">Estimated Resolution Time</span>
                    <strong>{aiReport.estimatedResolutionDays} days</strong>
                  </div>
                </div>

                <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                  <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">AI Recommendation Notes</span>
                  <p className="leading-relaxed text-zinc-300 font-mono text-[11px]">{aiReport.repairRecommendation}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      {/* Proximity Duplicate Warning Modal */}
      {showDuplicateModal && duplicateMatch && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 max-w-md w-full space-y-5 bg-zinc-950/90 shadow-2xl">
            <div className="flex items-center space-x-2 text-indigo-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <h3 className="text-base font-extrabold text-white">Similar Issue Found Nearby!</h3>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              A <strong className="text-zinc-200">{duplicateMatch.category}</strong> concern has already been reported <strong className="text-indigo-400">{duplicateMatch.distanceMeters} meters away</strong> from your location.
            </p>

            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 space-y-2 text-left">
              <div className="flex items-center space-x-2">
                <img 
                  src={duplicateMatch.imageUrl || 'https://images.unsplash.com/photo-1599740831146-80e6f87ad60b?auto=format&fit=crop&w=800&q=80'} 
                  alt="Existing Issue"
                  className="w-12 h-12 object-cover rounded-lg border border-zinc-800 shrink-0"
                />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-white truncate">{duplicateMatch.title}</h4>
                  <span className="text-[9px] text-zinc-500 block truncate font-mono">📍 {duplicateMatch.address}</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed italic">
                "{duplicateMatch.description}"
              </p>
            </div>

            <p className="text-[10px] text-zinc-550 leading-relaxed">
              To prevent duplicate dispatches and speed up municipal action, you can confirm this existing report instead of creating a new one.
            </p>

            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleVoteExisting}
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-505 hover:bg-emerald-400 bg-emerald-500 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Vote & Verify Existing (+15 XP)</span>
              </button>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={async () => {
                    setShowDuplicateModal(false);
                    await submitFormPayload();
                  }}
                  disabled={submitting}
                  className="flex-1 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold text-[11px] rounded-lg transition-all"
                >
                  File Anyway
                </button>
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(false)}
                  className="flex-1 py-2 bg-transparent text-zinc-500 hover:text-zinc-300 text-[11px] rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
