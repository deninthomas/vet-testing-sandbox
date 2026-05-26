'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Search, HelpCircle, AlertTriangle, Calendar, Phone, User, Check, RefreshCw } from 'lucide-react';

export default function AdoptionPortal() {
  const [animals, setAnimals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [sortBy, setSortBy] = useState('');
  
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [adoptionDate, setAdoptionDate] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAnimals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/adoption');
      const data = await res.json();
      if (res.ok) {
        setAnimals(data.animals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
  }, []);

  const handleOpenAdoptModal = (animal: any) => {
    setSelectedAnimal(animal);
    setError('');
    setMessage('');
  };

  const handleCloseModal = () => {
    setSelectedAnimal(null);
    setApplicantName('');
    setApplicantPhone('');
    setAdoptionDate('');
    setError('');
    setMessage('');
  };

  const handleApplyAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setApplyLoading(true);

    // DELIBERATE BUG: Future/Past Date validation check is missing.
    // We do not check if the selected adoptionDate is in the past!
    // Users can choose yesterday's date, and it will be accepted by the API.

    try {
      const res = await fetch('/api/adoption/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animalId: selectedAnimal._id,
          applicantName,
          applicantPhone,
          adoptionDate, // no date validation
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // DELIBERATE BUG: If it crashed (500), we display the raw stack trace/error 
        // directly in a big warning box, representing a crash!
        setError(data.error || 'Server error occurred.');
      } else {
        setMessage(data.message || 'Application submitted successfully!');
        // Refresh animal list
        loadAnimals();
        setTimeout(() => {
          handleCloseModal();
        }, 1800);
      }
    } catch (err: any) {
      console.error(err);
      setError('Connection failure: ' + err.message);
    } finally {
      setApplyLoading(false);
    }
  };

  // Filter animals based on search query and species filter
  const filteredAnimals = animals.filter((animal) => {
    // DELIBERATE BUG: Case-sensitive breed matching!
    const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (animal.breed && animal.breed.includes(searchQuery));
    
    if (speciesFilter === 'All') return matchesSearch;
    return animal.species.toLowerCase() === speciesFilter.toLowerCase() && matchesSearch;
  });

  // DELIBERATE BUG: Alphabetical sorting of age string!
  const sortedAnimals = [...filteredAnimals];
  if (sortBy === 'age') {
    sortedAnimals.sort((a, b) => a.age.localeCompare(b.age));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Hero Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl flex items-center gap-2">
          <Heart className="text-rose-500 w-8 h-8 fill-rose-500/10" /> Orphaned Pet Adoption Portal
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-3xl">
          Meet our adorable rescues waiting to join their forever families. Filter by species, learn their temperaments, and submit your application online.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by animal name or breed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-350 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none"
          >
            <option value="">No Sorting</option>
            <option value="age">Sort by Age (Alphabetical Bug!)</option>
          </select>

          {['All', 'Dog', 'Cat'].map((category) => (
            <button
              key={category}
              onClick={() => setSpeciesFilter(category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                speciesFilter === category
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-zinc-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {category}s
            </button>
          ))}
          <button 
            onClick={loadAnimals}
            className="p-2 border border-zinc-250 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer text-zinc-500"
            title="Reload Animals"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500">Loading animals directory...</div>
      ) : filteredAnimals.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center py-16 rounded-2xl text-zinc-550">
          No animals found matching your search.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedAnimals.map((animal) => {
            const isAdopted = animal.status === 'adopted';
            return (
              <div 
                key={animal._id} 
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-250 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Animal Photo */}
                <div className="h-60 bg-zinc-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={animal.imageUrl} alt={animal.name} className="object-cover w-full h-full" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow border ${
                      isAdopted 
                        ? 'bg-rose-500 text-white border-rose-600' 
                        : 'bg-emerald-500 text-white border-emerald-600'
                    }`}>
                      {animal.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-850 dark:text-zinc-100 flex items-center gap-1.5">
                      {animal.name} 
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
                        {animal.age}
                      </span>
                    </h3>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">{animal.species} &bull; {animal.breed}</p>
                  </div>

                  <div className="text-xs space-y-1.5 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                    <div>
                      <span className="font-bold text-zinc-450">Health Status:</span>{' '}
                      <span className="text-zinc-650 dark:text-zinc-350">{animal.healthStatus}</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-450">Temperament:</span>{' '}
                      <span className="text-zinc-650 dark:text-zinc-350">{animal.temperament}</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-150 dark:border-zinc-800/60 px-6 py-4 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400 font-mono">ID: {animal._id}</span>
                  
                  {/* DELIBERATE BUG: Status Sync Bug!
                      Even though the animal's status is 'adopted', we still render the active "Adopt Now" button.
                      Clicking this button on an already adopted animal will open the application form, 
                      which will crash the server on submit, throwing a 500 error! */}
                  <button
                    onClick={() => handleOpenAdoptModal(animal)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm ${
                      isAdopted 
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10' 
                        : 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/10'
                    }`}
                  >
                    Adopt Now {isAdopted && '(Adopted - Buggy Link!)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Adoption Form Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-250 dark:border-zinc-800 max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Close */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer text-lg font-bold"
            >
              &times;
            </button>

            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Adopt {selectedAnimal.name}</h2>
              <p className="text-xs text-zinc-400">Fill in the application to schedule a meeting and finalize adoption details.</p>
            </div>

            {/* Error box - displays raw stack trace if API returns 500 */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 p-4 rounded-xl space-y-2 text-xs font-mono">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" /> API CRASHED (500 ERROR)
                </div>
                <p className="font-semibold">{error}</p>
                <div className="bg-black/5 dark:bg-black/20 p-2 rounded max-h-32 overflow-y-auto text-[10px] leading-relaxed select-text">
                  Stack Trace:
                  <br />
                  at page.tsx:143 (applyAdoption)
                  <br />
                  at api/adoption/apply/route.ts:25 (POST)
                  <br />
                  at AnimalMatchingService.execute (matchingService.js:82)
                  <br />
                  NullPointerException: cannot read property &quot;owner_id&quot; of null.
                </div>
              </div>
            )}

            {message && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-450 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleApplyAdoption} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Your Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Robert Vance"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Your Contact Phone *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="555-019-2834"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Desired Adoption Date (Allows past dates!)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  {/* Note: we do not add min date check, allowing any past date! */}
                  <input
                    type="date"
                    required
                    value={adoptionDate}
                    onChange={(e) => setAdoptionDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-grow py-2.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyLoading}
                  className="flex-grow py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/10"
                >
                  {applyLoading ? 'Submitting...' : 'Apply to Adopt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QA Warning description */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/25 rounded-2xl space-y-2 text-xs">
        <h4 className="font-bold text-amber-500 flex items-center gap-1.5">
          💡 QA Testing Guide: Adoption Portal Bugs
        </h4>
        <ul className="list-disc list-inside space-y-1.5 text-zinc-450 leading-relaxed">
          <li>
            <strong className="text-zinc-300">Status Sync Bug:</strong> When an animal status becomes &quot;Adopted&quot; (like Max, or any animal you successfully apply for), it is still visible in the public directory list! 
          </li>
          <li>
            <strong className="text-zinc-300">Application 500 Crash:</strong> If you click &quot;Adopt Now&quot; on an already adopted animal and submit the form, the backend will crash with a <strong className="text-rose-500">500 Server Error</strong>. Try testing this with &quot;Max&quot;!
          </li>
          <li>
            <strong className="text-zinc-300">Date Validation Bug:</strong> Open the adoption modal on an available animal and check if you can select a date in the past (e.g. 1999). It will successfully submit without any warning!
          </li>
        </ul>
      </div>
    </div>
  );
}
