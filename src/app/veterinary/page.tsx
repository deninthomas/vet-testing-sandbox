'use client';

import React, { useState, useEffect } from 'react';
import { LifeBuoy, MapPin, Phone, Star, ShieldAlert, Award } from 'lucide-react';

export default function VeterinaryDirectory() {
  const [vets, setVets] = useState<any[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Embedded Appointment Form States
  const [bookingClinicId, setBookingClinicId] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const loadVets = async (city = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/veterinary?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (res.ok) {
        setVets(data.vets || []);
      } else {
        setError(data.error || 'Failed to load hospitals.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVets(cityFilter);
  }, [cityFilter]);

  // DELIBERATE BUG: Filter crash bug!
  // If the filtered vets list is empty (because there are no hospitals in that city),
  // the code attempts to read 'vets[0].name' to show the featured clinic highlight,
  // throwing a 'TypeError: Cannot read properties of undefined (reading name)' which crashes the page rendering.
  let featuredClinic = null;
  if (!loading && vets) {
    // If the city is "Suburbs", there are no clinics, vets is [], vets[0] is undefined!
    // This line will crash the render!
    featuredClinic = vets[0];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl flex items-center gap-2">
          <LifeBuoy className="text-rose-500 w-8 h-8" /> Veterinary Clinics Directory
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-3xl">
          Quickly find and contact local veterinary clinics, emergency hospitals, and dental surgeons in your vicinity.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <span className="text-sm font-semibold">Filter by Location:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCityFilter('')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              cityFilter === ''
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200'
            }`}
          >
            All Cities
          </button>
          <button
            onClick={() => setCityFilter('Downtown')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              cityFilter === 'Downtown'
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-105 dark:bg-zinc-800 hover:bg-zinc-200'
            }`}
          >
            Downtown
          </button>
          <button
            onClick={() => setCityFilter('Uptown')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              cityFilter === 'Uptown'
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-105 dark:bg-zinc-800 hover:bg-zinc-200'
            }`}
          >
            Uptown
          </button>
          {/* Suburbs option will cause a crash because it returns an empty list, triggering vets[0].name crash! */}
          <button
            onClick={() => setCityFilter('Suburbs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              cityFilter === 'Suburbs'
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-105 dark:bg-zinc-800 hover:bg-zinc-200'
            }`}
          >
            Suburbs (Empty Clinic City - Crash Bug!)
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Featured Clinic Highlight */}
      {!loading && featuredClinic && (
        <div className="bg-gradient-to-tr from-amber-500/10 to-rose-500/10 border border-amber-500/20 p-6 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-amber-500/20"><Award className="w-16 h-16" /></div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wide uppercase flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500" /> Featured Clinic in Selected City
          </span>
          {/* CRASH TRIGGER: vets[0] must exist. If vets = [], vets[0] is undefined,
              and this next line will throw: Cannot read properties of undefined (reading 'name') */}
          <h2 className="text-xl font-bold">{featuredClinic.name}</h2>
          <p className="text-xs text-zinc-550 max-w-xl">Specialty: {featuredClinic.specialty} &bull; Rating: {featuredClinic.rating}/5.0</p>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading clinics directory...</div>
      ) : vets.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center py-12 rounded-2xl text-zinc-500">
          No clinics found in this city.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* DELIBERATE BUG: Sorted from lowest rating to highest rating (inverted sort) */}
          {[...vets].sort((a, b) => a.rating - b.rating).map((v) => (
            <div key={v._id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-base text-zinc-850 dark:text-zinc-150 leading-tight">{v.name}</h3>
                  <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> <span className="text-xs font-bold font-mono">{v.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-mono">Specialty: {v.specialty}</p>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-450 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 font-mono">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> {v.address}, {v.city}</div>
                {/* DELIBERATE BUG: tel: URL has an 'a' appended at the end (dialing prefix typo) */}
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <a href={`tel:${v.phone}a`} className="hover:underline text-amber-600 font-bold">{v.phone}</a>
                </div>
              </div>

              {bookingClinicId === v._id ? (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await fetch('/api/veterinary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          clinicId: v._id,
                          petName,
                          reason: bookingReason,
                          date: bookingDate,
                          time: bookingTime
                        })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setBookingSuccess(`Confirmed! Swapped Clinic Bug Alert: ${data.message}`);
                        setTimeout(() => {
                          setBookingSuccess(null);
                          setBookingClinicId(null);
                          setPetName('');
                          setBookingDate('');
                          setBookingTime('');
                          setBookingReason('');
                        }, 5000);
                      } else {
                        alert(data.error || 'Failed to book appointment');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Connection error booking appointment.');
                    }
                  }}
                  className="space-y-2 border-t border-zinc-150 dark:border-zinc-800 pt-3 text-left font-sans"
                >
                  <h4 className="text-xs font-bold text-amber-500">Book Appointment</h4>
                  
                  {bookingSuccess && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-600 dark:text-emerald-450 p-2 rounded text-[10px] font-semibold leading-tight">
                      {bookingSuccess}
                    </div>
                  )}

                  <div className="space-y-1.5 text-[11px] font-sans">
                    <input
                      type="text"
                      required
                      placeholder="Pet Name (e.g. Buddy)"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full p-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Reason (e.g. Checkup)"
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                      className="w-full p-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full p-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs"
                      />
                      <input
                        type="time"
                        required
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full p-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setBookingClinicId(null)}
                      className="px-2 py-1 text-[10px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2 py-1 text-[10px] bg-amber-500 hover:bg-amber-600 text-black rounded font-semibold cursor-pointer"
                    >
                      Confirm
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setBookingClinicId(v._id);
                      setBookingSuccess(null);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                  >
                    Book Appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QA Warning description */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/25 rounded-2xl space-y-2 text-xs">
        <h4 className="font-bold text-amber-500 flex items-center gap-1.5">
          💡 QA Testing Guide: Veterinary Directory Crash Bug
        </h4>
        <p className="text-zinc-400 leading-relaxed">
          Click the <strong className="text-zinc-200">Suburbs</strong> filter button. This city has 0 hospitals, returning an empty array. The client page code attempts to read <code className="text-zinc-300">vets[0].name</code> to show the Featured Clinic block, causing a React component crash (<strong className="text-rose-500">TypeError: Cannot read properties of undefined</strong>) and showing a blank screen or a crash indicator. Reload the page to recover.
        </p>
      </div>
    </div>
  );
}
