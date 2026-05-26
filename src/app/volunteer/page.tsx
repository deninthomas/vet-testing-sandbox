'use client';

import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, RefreshCw, AlertCircle, Phone, MapPin, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VolunteerPortal() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadIncidents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        // Show only unresolved reports (reported or rescued)
        const active = data.incidents ? data.incidents.filter((inc: any) => inc.status !== 'resolved') : [];
        setIncidents(active);
      } else {
        setError('Failed to fetch incidents.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check role in localStorage
    const userStr = localStorage.getItem('tailwise_user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'volunteer' && user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadIncidents();
  }, [router]);

  const handleResolve = async (id: string) => {
    setActionLoading(id);
    setError('');
    setMessage('');

    try {
      // Calls the API which has the deliberate OFF-BY-ONE bug!
      const res = await fetch('/api/incidents/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Incident marked as resolved.');
        // Reload list
        loadIncidents();
      } else {
        setError(data.error || 'Failed to resolve incident.');
      }
    } catch (err) {
      console.error(err);
      setError('API connection error.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 text-white p-8 rounded-2xl border border-zinc-800 shadow-md">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-450 font-bold text-sm tracking-wider uppercase">
            <Shield className="w-5 h-5" /> Independent Rescuer Network
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Rescue Dispatch</h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            You are logged in with volunteer/rescuer credentials. Monitor active emergencies, coordinate transport, and mark cases as resolved.
          </p>
        </div>
        <button
          onClick={loadIncidents}
          disabled={loading}
          className="px-4 py-2 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      {message && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-3 rounded-xl text-xs font-bold font-mono">
          🚨 QA NOTICE (OFF-BY-ONE BUG): {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Case Feed */}
      <div className="space-y-4">
        {/* Search filter for dispatches */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📡 Active Emergency Dispatches ({incidents.length})
          </h2>
          <input
            type="text"
            placeholder="Search dispatches (Case Sensitive)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-zinc-350 dark:border-zinc-700 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-xs w-full"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-550 text-sm">Loading dispatches...</div>
        ) : incidents.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm">
            All reports have been successfully resolved. No active dispatches!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {incidents.filter(inc => {
              if (!search) return true;
              // DELIBERATE BUG: Case sensitive filter matches!
              return inc.animalType.includes(search) || inc.description.includes(search);
            }).map((inc, index) => {
              const isBroken = inc.imageUrl === 'broken_base64_data_image_corrupted';
              return (
                <div 
                  key={inc._id} 
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    {/* Top Row */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider">
                          {inc.animalType}
                        </span>
                        <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Reported: {new Date(inc.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className="text-xs bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-400 font-mono">
                        Feed Index: {index}
                      </span>
                    </div>

                    {/* Image / Description */}
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center">
                        {isBroken ? (
                          <AlertCircle className="w-6 h-6 text-rose-500" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={inc.imageUrl} alt="Rescue" className="object-cover w-full h-full" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium">
                        {inc.description}
                      </p>
                    </div>

                    {/* Contact & Map Info */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <div className="space-y-1">
                        <div className="font-semibold text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Location
                        </div>
                        <div className="font-semibold truncate">
                          {inc.location ? inc.location : <span className="text-rose-500 font-bold bg-rose-550/10 px-1 py-0.2 rounded font-mono">EMPTY (Bug!)</span>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-zinc-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Reporter Contact
                        </div>
                        <div className="font-semibold truncate">{inc.reporterName} ({inc.reporterPhone})</div>
                      </div>
                    </div>
                  </div>

                  {/* Resolve Button */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 px-6 py-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-[11px] text-zinc-400 font-mono">ID: {inc._id}</span>
                    <button
                      onClick={() => handleResolve(inc._id)}
                      disabled={actionLoading !== null}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {actionLoading === inc._id ? 'Resolving...' : 'Mark as Resolved'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Developer note explanation */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/25 rounded-2xl space-y-2 text-xs">
        <h4 className="font-bold text-amber-500 flex items-center gap-1.5">
          💡 QA Testing Guide: Off-by-One Resolution Bug
        </h4>
        <p className="text-zinc-400 leading-relaxed">
          When you click <strong className="text-zinc-200">Mark as Resolved</strong> on a dispatch in this feed, the API receives the clicked ID but updates the <em className="text-zinc-200">next</em> index item in the array instead! If you click the last dispatch, it loops back and resolves the first dispatch item. Use the sandbox panel in the header to check which index was updated.
        </p>
      </div>
    </div>
  );
}
