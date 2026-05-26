'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, 
  Activity, 
  ShoppingBag, 
  Landmark, 
  Shield, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Award, 
  Plus, 
  Sparkles, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw, 
  Star, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import NotificationModal from '@/components/NotificationModal';

export default function UserDashboard() {
  const router = useRouter();
  
  // User Session State
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Dashboard Data States
  const [incidents, setIncidents] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Popup States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [onModalClose, setOnModalClose] = useState<(() => void) | undefined>(undefined);

  // Quick Donation State
  const [donateAmount, setDonateAmount] = useState('25');
  const [donateCause, setDonateCause] = useState('Stray Vaccination Fund');
  const [donating, setDonating] = useState(false);

  // Quick Feedback State
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const loadData = async (user: any) => {
    setLoading(true);
    try {
      // 1. Fetch incidents
      const incRes = await fetch('/api/incidents');
      const incData = await incRes.json();
      
      // Filter incidents where reporter is this user (case-insensitive name match or phone match)
      const userInc = incData.incidents ? incData.incidents.filter((inc: any) => 
        (inc.reporterName && inc.reporterName.toLowerCase() === user.name?.toLowerCase()) ||
        (inc.reporterPhone && inc.reporterPhone === user.phone)
      ) : [];
      setIncidents(userInc);

      // 2. Fetch donations
      const donRes = await fetch('/api/donations');
      const donData = await donRes.json();
      
      // Filter donations by donor name
      const userDon = donData.donations ? donData.donations.filter((d: any) => 
        d.donorName && d.donorName.toLowerCase() === user.name?.toLowerCase()
      ) : [];
      setDonations(userDon);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('tailwise_user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // Redirect Admin and Volunteer to their respective screens
      if (user.role === 'admin') {
        router.push('/admin');
        return;
      }
      if (user.role === 'volunteer') {
        router.push('/volunteer');
        return;
      }
      
      setCurrentUser(user);
      loadData(user);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
    router.refresh();
  };

  const handleQuickDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setDonating(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: currentUser.name,
          amount: Number(donateAmount),
          cause: donateCause
        })
      });

      const data = await res.json();

      if (res.ok) {
        setModalType('success');
        setModalTitle('Thank You! 💖');
        setModalMessage(`Your generous donation of $${donateAmount} to the "${donateCause}" cause has been received. You are helping make a difference!`);
        setModalOpen(true);
        setDonateAmount('25');
        loadData(currentUser);
      } else {
        setModalType('error');
        setModalTitle('Donation Failed');
        setModalMessage(data.error || 'Unable to process donation. Please try again.');
        setModalOpen(true);
      }
    } catch (err: any) {
      setModalType('error');
      setModalTitle('Connection Error');
      setModalMessage(err.message || 'Unable to connect to donation service.');
      setModalOpen(true);
    } finally {
      setDonating(false);
    }
  };

  const handleQuickFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmittingFeedback(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: currentUser.name,
          comment: feedbackComment,
          rating: feedbackRating
        })
      });

      const data = await res.json();

      if (res.ok) {
        setModalType('success');
        setModalTitle('Feedback Submitted!');
        setModalMessage(`Thank you for helping us improve TailWise. Your response has been logged. Reason: "${data.feedback?.comment || 'Saved'}"`);
        setModalOpen(true);
        setFeedbackComment('');
        setFeedbackRating(5);
      } else {
        // If it was a 500 error or simulated crash, data contains the error
        setModalType('error');
        setModalTitle('Feedback Crash (Simulated)');
        setModalMessage(data.error || 'Simulated error triggered.');
        setModalOpen(true);
      }
    } catch (err: any) {
      setModalType('error');
      setModalTitle('Simulation Error');
      setModalMessage(err.message || 'A crash occurred.');
      setModalOpen(true);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!currentUser) {
    return <div className="text-center py-16 text-zinc-550">Verifying session...</div>;
  }

  // Calculate totals
  const totalDonationValue = donations.reduce((sum, d) => sum + d.amount, 0);
  const activeCases = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-8 border border-zinc-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-3.5 h-3.5" /> TailWise Registered Member
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome Back, {currentUser.name}! 🐾
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-zinc-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-500" /> {currentUser.email}</span>
            {currentUser.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-500" /> {currentUser.phone}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0 relative z-10">
          <Link
            href="/profile"
            className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition text-zinc-300"
          >
            Edit Profile
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-650/10 hover:bg-red-650/20 border border-red-900/30 hover:border-red-900/50 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold">{incidents.length}</div>
            <div className="text-xs text-zinc-500 font-semibold mt-0.5">Emergency Incidents Reported</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-650 dark:text-emerald-500">${totalDonationValue}</div>
            <div className="text-xs text-zinc-500 font-semibold mt-0.5">Total Contributed Donations</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-650 dark:text-amber-500">{activeCases}</div>
            <div className="text-xs text-zinc-500 font-semibold mt-0.5">Pending Active Rescue Cases</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left column (Activity tables) & Right column (Quick forms) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Incident Logs & Donations List */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Incident Logs */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" /> My Reported Incidents
              </h2>
              <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {incidents.length} Filed
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-zinc-500 text-sm">Loading activity logs...</div>
            ) : incidents.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm space-y-3">
                <p>You haven&apos;t filed any emergency rescue incidents yet.</p>
                <Link
                  href="/incidents"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-500/10"
                >
                  <Plus className="w-3.5 h-3.5" /> File First Incident Report
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-bold">
                    <tr>
                      <th className="px-6 py-3.5">Incident ID</th>
                      <th className="px-6 py-3.5">Animal Type</th>
                      <th className="px-6 py-3.5">Description</th>
                      <th className="px-6 py-3.5">Date Reported</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                    {incidents.map((inc) => (
                      <tr key={inc._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                        <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">{inc._id}</td>
                        <td className="px-6 py-4 font-bold">{inc.animalType}</td>
                        <td className="px-6 py-4 text-zinc-550 max-w-xs truncate">{inc.description}</td>
                        <td className="px-6 py-4 text-zinc-400 font-mono">{new Date(inc.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            inc.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : inc.status === 'rescued'
                              ? 'bg-blue-500/10 text-blue-550 dark:text-blue-400 border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Donation Logs */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-500" /> My Donation History
              </h2>
              <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {donations.length} Transactions
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-zinc-500 text-sm">Loading transactions...</div>
            ) : donations.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm space-y-3">
                <p>You haven&apos;t contributed monetary support yet.</p>
                <Link
                  href="/donations"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-555/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Support With A Donation
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-bold">
                    <tr>
                      <th className="px-6 py-3.5">Transaction ID</th>
                      <th className="px-6 py-3.5">Cause Name</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                    {donations.map((d) => (
                      <tr key={d._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                        <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">{d._id}</td>
                        <td className="px-6 py-4 font-bold">{d.cause}</td>
                        <td className="px-6 py-4 text-zinc-400 font-mono">{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-650 dark:text-emerald-550">+${d.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): Quick Donation, Feedback & Action Center */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
              <Sparkles className="w-4 h-4 text-amber-500" /> Member Quick Access
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/incidents"
                className="p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-xl text-center flex flex-col items-center gap-2 transition"
              >
                <Activity className="w-5 h-5 text-rose-500" />
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-455">Report Rescue</span>
              </Link>

              <Link 
                href="/adoption"
                className="p-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 rounded-xl text-center flex flex-col items-center gap-2 transition"
              >
                <Heart className="w-5 h-5 text-amber-500" />
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Adopt Pet</span>
              </Link>

              <Link 
                href="/donations"
                className="p-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-center flex flex-col items-center gap-2 transition"
              >
                <Landmark className="w-5 h-5 text-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-650 dark:text-emerald-450">Donations</span>
              </Link>

              <Link 
                href="/veterinary"
                className="p-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/15 rounded-xl text-center flex flex-col items-center gap-2 transition"
              >
                <ShoppingBag className="w-5 h-5 text-blue-550 dark:text-blue-400" />
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Vet Directory</span>
              </Link>
            </div>
          </div>

          {/* Quick Donation Widget */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-bold text-sm flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-800 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-555" /> Quick Contribution
            </h3>
            <form onSubmit={handleQuickDonation} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Select Amount ($)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['10', '25', '50', '100'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonateAmount(amt)}
                      className={`py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        donateAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-650 dark:bg-zinc-850 dark:border-zinc-700 dark:text-zinc-350'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  placeholder="Custom Amount"
                  className="w-full mt-2 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Target Welfare Cause</label>
                <select
                  value={donateCause}
                  onChange={(e) => setDonateCause(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="General Welfare Fund">General Fund</option>
                  <option value="Stray Vaccination Fund">Stray Vaccination Fund</option>
                  <option value="Orphan Shelter Support">Orphan Shelter Support</option>
                  <option value="Emergency Ambulance Fuel">Emergency Ambulance Fuel</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={donating}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/10"
              >
                {donating ? 'Processing...' : `Donate $${donateAmount} Now`}
              </button>
            </form>
          </div>

          {/* Quick Feedback Form widget */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-bold text-sm flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-800 pb-2">
              <MessageSquare className="w-4 h-4 text-amber-500" /> Share Platform Feedback
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Submit your experience to our administrators. (Test: Include the word &quot;crash&quot; in comment to trigger API simulated 500 error!)
            </p>
            <form onSubmit={handleQuickFeedback} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="cursor-pointer text-amber-500 focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${star <= feedbackRating ? 'fill-amber-550 text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Comments / Suggestions</label>
                <textarea
                  required
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share details of your experience..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-350 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/10"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>

        </div>
      </div>

      <NotificationModal
        isOpen={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setModalOpen(false);
          if (onModalClose) {
            onModalClose();
          }
        }}
      />
    </div>
  );
}
