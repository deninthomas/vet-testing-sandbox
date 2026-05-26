'use client';

import React, { useState, useEffect } from 'react';
import { Activity, MapPin, Phone, User, AlertCircle, FileImage, Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [animalType, setAnimalType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageName, setImageName] = useState('stray_dog_park.jpg');
  const [imageSizeMB, setImageSizeMB] = useState(1.2); // Simulator for file size
  const [imageUrl, setImageUrl] = useState('');
  
  const [mlLoading, setMlLoading] = useState(false);
  const [mlResult, setMlResult] = useState<any>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load incidents
  const loadIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.ok ? await res.json() : { incidents: [] };
      setIncidents(data.incidents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleScanImage = async () => {
    setMlLoading(true);
    setMlResult(null);
    setError('');

    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: imageName }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMlResult(data);
        setAnimalType(data.species); // Auto-fill the animal type!
      } else {
        setError(data.error || 'AI Scan failed');
      }
    } catch (err) {
      console.error(err);
      setError('AI service connection error');
    } finally {
      setMlLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitLoading(true);

    // DELIBERATE BUG: Missing Location Check!
    // Junior developer forgot to validate that 'location' is not empty, 
    // letting the form submit and save blank values to the database.

    // Simulating file upload to base64 or custom string
    // If the size is >2MB, we send a huge string that the backend turns into a broken image
    let finalImageUrl = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=60';
    if (imageSizeMB > 2) {
      // Send dummy huge string to trigger the backend's >2MB corruption bug
      finalImageUrl = 'A'.repeat(600000); 
    } else {
      // Mock different images based on scanned breed or type
      if (animalType.toLowerCase().includes('dog')) {
        finalImageUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=60';
      } else if (animalType.toLowerCase().includes('cat')) {
        finalImageUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=60';
      }
    }

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterName,
          reporterPhone,
          animalType,
          description,
          location, // blank is allowed due to bug!
          imageUrl: finalImageUrl,
          latitude, // Swapped on backend!
          longitude,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit report');
      } else {
        setMessage('Emergency report submitted successfully!');
        setReporterName('');
        setReporterPhone('');
        setAnimalType('');
        setDescription('');
        setLocation('');
        setLatitude('');
        setLongitude('');
        setMlResult(null);
        loadIncidents();
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl flex items-center gap-2">
          <Activity className="text-rose-500 w-8 h-8" /> Active Rescue Emergencies
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-3xl">
          Report stray animals suffering from injuries, severe illness, or trauma. Independent rescuers and volunteers will be notified to coordinate rescue operations.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Report Form - Column 5 */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold border-b border-zinc-155 dark:border-zinc-800 pb-3 flex items-center gap-2">
            🚨 File Emergency Report
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-450 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Machine Learning Helper Card */}
          <div className="p-4 rounded-xl bg-gradient-to-tr from-amber-500/5 to-rose-500/5 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Species Identifier (ML)
              </span>
              <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">MobileNetV3</span>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-550">Select/Enter Image Filename to Scan:</label>
              <div className="flex gap-2">
                <select
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  className="flex-grow px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:outline-none"
                >
                  <option value="stray_dog_park.jpg">stray_dog_park.jpg (Should be Dog)</option>
                  <option value="boxer_pet.jpg">boxer_pet.jpg (No 'd' - Will classify as Cat! Bug!)</option>
                  <option value="kitten_feeding.jpg">kitten_feeding.jpg (Has 'd' - Will classify as Dog! Bug!)</option>
                  <option value="tabby_cat_bush.png">tabby_cat_bush.png (Should be Cat)</option>
                  <option value="wounded_shepherd.png">wounded_shepherd.png (Has 'd' - Should be Dog)</option>
                </select>
                <button
                  type="button"
                  onClick={handleScanImage}
                  disabled={mlLoading}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {mlLoading ? 'Scanning...' : 'Scan'}
                </button>
              </div>
            </div>

            {/* Image Size Simulator */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-zinc-550 flex justify-between">
                <span>Simulated Image Upload Size:</span>
                <span className={imageSizeMB > 2 ? 'text-rose-500 font-bold' : 'text-zinc-500'}>
                  {imageSizeMB} MB {imageSizeMB > 2 && '(Over 2MB Buggy Limit!)'}
                </span>
              </label>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.5"
                value={imageSizeMB}
                onChange={(e) => setImageSizeMB(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {mlResult && (
              <div className="p-3 rounded-lg bg-white/70 dark:bg-zinc-950/70 border border-zinc-150 dark:border-zinc-800 text-xs space-y-1 animate-in fade-in duration-200">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">Prediction Results:</div>
                <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-zinc-500">
                  <div>Detected Species: <span className="text-amber-600 font-bold">{mlResult.species}</span></div>
                  <div>Confidence: <span className="text-zinc-700 dark:text-zinc-300 font-bold">{(mlResult.confidence * 100).toFixed(0)}%</span></div>
                  <div className="col-span-2">Detected Breed: <span className="text-zinc-700 dark:text-zinc-300">{mlResult.breed}</span></div>
                </div>
                <div className="text-[9px] text-zinc-400 italic mt-1 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                  Form field &quot;Animal Type&quot; auto-filled.
                </div>
              </div>
            )}
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Reporter Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Mark Smith"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Contact Phone *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="123-456-7890"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Animal Type / Species *</label>
              <input
                type="text"
                required
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                placeholder="e.g. Dog, Cat, Bird"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Location Address (Bypasses check, allows blank!)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Central Park Zoo, near Sector 5"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold mb-1">GPS Latitude (Swapped on save! Bug)</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 40.7128"
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-[11px] focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1">GPS Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. -74.0060"
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-[11px] focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Injury / Distress Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the condition, size, behavior, and environment..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition duration-150 disabled:opacity-50 cursor-pointer shadow-md shadow-rose-500/10"
            >
              {submitLoading ? 'Submitting Report...' : 'Submit Emergency Report'}
            </button>
          </form>
        </div>

        {/* Incidents List - Column 7 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="text-lg font-bold">Reported Case Logs</h2>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-850 px-2.5 py-1 rounded-full font-medium text-zinc-550">
              {incidents.length} total reports
            </span>
          </div>

          {incidents.length === 0 ? (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center py-12 rounded-2xl text-zinc-500 text-sm">
              No reported emergency incidents.
            </div>
          ) : (
            <div className="grid gap-4">
              {incidents.map((inc) => {
                const isBrokenImage = inc.imageUrl === 'broken_base64_data_image_corrupted';
                return (
                  <div 
                    key={inc._id} 
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row"
                  >
                    {/* Incident Image */}
                    <div className="w-full sm:w-40 h-40 sm:h-auto bg-zinc-100 shrink-0 relative flex items-center justify-center border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800">
                      {isBrokenImage ? (
                        <div className="flex flex-col items-center gap-1.5 p-4 text-center select-none text-zinc-400">
                          <AlertCircle className="w-8 h-8 text-rose-500" />
                          <span className="text-[10px] font-semibold text-rose-600 font-mono">IMAGE CORRUPTED (&gt;2MB BUG)</span>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={inc.imageUrl} 
                          alt="Incident" 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // Fail-safe to avoid full page breaks, falls back to a clean text
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider">
                            {inc.animalType}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            inc.status === 'resolved' 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : inc.status === 'rescued'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono">{new Date(inc.createdAt).toLocaleString()}</p>
                        <p className="text-sm font-medium text-zinc-850 dark:text-zinc-200">{inc.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                          <span className="truncate">
                            {/* BUG: Will display blank if the user submitted without location! */}
                            {inc.location ? inc.location : <span className="text-rose-500 font-bold bg-rose-550/10 px-1 py-0.2 rounded font-mono">Location Empty (Bug!)</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-550">
                          <User className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                          <span className="truncate">{inc.reporterName} ({inc.reporterPhone})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
