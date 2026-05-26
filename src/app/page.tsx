'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Activity, ShoppingBag, Gift, ArrowRight, ShieldAlert, Award, Calendar, MapPin } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({ incidents: 0, available: 0, products: 0, donations: 0 });
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    // Fetch stats and campaigns
    const loadData = async () => {
      try {
        const incRes = await fetch('/api/incidents');
        const incData = await incRes.json();
        
        const adoptRes = await fetch('/api/adoption');
        const adoptData = await adoptRes.json();

        const petRes = await fetch('/api/petShop');
        const petData = await petRes.json();

        const donRes = await fetch('/api/donations');
        const donData = await donRes.json();

        const activeIncidents = incData.incidents ? incData.incidents.filter((i: any) => i.status !== 'resolved').length : 0;
        const availableAnimals = adoptData.animals ? adoptData.animals.filter((a: any) => a.status === 'available').length : 0;
        const totalDonationsSum = donData.donations ? donData.donations.reduce((sum: number, d: any) => sum + d.amount, 0) : 0;

        setStats({
          incidents: activeIncidents,
          available: availableAnimals,
          products: petData.products ? petData.products.length : 0,
          donations: totalDonationsSum
        });

        // Set mock campaigns
        setCampaigns([
          { _id: 'c1', title: 'Adoption Drive & Fun Fair', description: 'Come meet lovable animals ready to find their forever homes. Fun activities for kids!', date: '2026-06-15', location: 'City Park Meadow' },
          { _id: 'c2', title: 'Free Vaccination Campaign', description: 'Get free rabies and basic vaccines for your pets. Sponsored by City Animal Hospital.', date: '2026-07-02', location: 'Downtown Community Center' }
        ]);

      } catch (err) {
        console.error('Error loading home data:', err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 py-24 text-white sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-zinc-900 to-zinc-950 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <Award className="w-3.5 h-3.5" /> Autonomous Animal Welfare Portal
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-rose-400 to-red-500 bg-clip-text text-transparent">
                Saving Lives. <br />
                Fostering Love.
              </h1>
              <p className="text-lg text-zinc-300 max-w-xl">
                TailWise bridges the gap between stray/injured animals, local communities, volunteers, and veterinarians. Report incidents, adopt orphans, contribute donations, or support pet businesses all in one place.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/incidents"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Report an Emergency
                </Link>
                <Link
                  href="/adoption"
                  className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Adopt a Pet
                </Link>
              </div>
            </div>
            <div className="mt-16 lg:mt-0 lg:col-span-5 flex justify-center">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80" 
                  alt="Happy animals" 
                  className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-amber-400">Join independent rescuers</div>
                    <div className="text-zinc-400 mt-0.5">25 active volunteers nearby</div>
                  </div>
                  <Link href="/register" className="text-white hover:text-amber-400 font-bold flex items-center gap-0.5">
                    Sign Up <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-500">{stats.incidents}</div>
              <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Active Rescue Cases</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-500">{stats.available}</div>
              <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Animals Up For Adoption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-650 dark:text-emerald-500">${stats.donations}</div>
              <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Total Contributions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-500">{stats.products}</div>
              <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Pet Supplies Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services and Modules Grid */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything Needed for Animal Welfare
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              TailWise brings multiple separate modules together into one single autonomous portal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-rose-500 transition-colors">Emergency Reporting</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                Encountered an injured stray animal? Report the location immediately with a description and photos, allowing independent rescuers to handle the case.
              </p>
              <Link href="/incidents" className="text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1">
                Report Incident <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-amber-500 transition-colors">Pet Adoption Portal</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                Browse profiles of rescued animals looking for a loving home. Apply directly online and trace adoption milestones easily.
              </p>
              <Link href="/adoption" className="text-sm font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
                Explore Orphaned Pets <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors">Monetary Donations</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                Support rescue operations through transparent online donations. Contribute to specific medical rescue cases or our global operations.
              </p>
              <Link href="/donations" className="text-sm font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                Donate Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-blue-500 transition-colors">Pet Shop Accessories</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                Purchase high-quality pet supplies and accessories from local registered pet shops. Supporting our business partners helps sponsor free rescues.
              </p>
              <Link href="/petShop" className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                Shop Supplies <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 5 */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-500 transition-colors">Veterinary Directory</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                Quickly locate nearby veterinary clinics, hospitals, and emergency animal critical care centers with ratings, specialty lists, and phone directories.
              </p>
              <Link href="/veterinary" className="text-sm font-bold text-indigo-500 hover:text-indigo-650 flex items-center gap-1">
                Search Clinics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 6 */}
            <div className="bg-gradient-to-br from-amber-500 to-rose-600 p-8 rounded-2xl text-white shadow-lg shadow-amber-500/15 flex flex-col justify-between">
              <div>
                <ShieldAlert className="w-8 h-8 mb-6" />
                <h3 className="text-lg font-bold mb-2">Volunteer Program</h3>
                <p className="text-amber-50/80 text-sm leading-relaxed mb-6">
                  Are you an independent rescuer? Register as a volunteer to view active incident reports, respond to medical distress notifications, and update rescue cases.
                </p>
              </div>
              <Link href="/register" className="text-sm font-bold text-white hover:underline flex items-center gap-1">
                Register as Rescuer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns & Bulletin Board Section */}
      <section className="py-20 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Campaigns & Event Announcements
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Stay updated on local animal vaccination campaigns, adoption drives, and fundraisers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {campaigns.map((camp) => (
              <div key={camp._id} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row gap-6 items-start">
                <div className="p-4 rounded-xl bg-amber-500/10 text-amber-500 flex flex-col items-center justify-center shrink-0 w-16 h-16">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{camp.date}</span>
                  <h3 className="text-lg font-bold">{camp.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">{camp.description}</p>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium pt-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {camp.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
