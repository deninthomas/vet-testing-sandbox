'use client';

import React, { useState, useEffect } from 'react';
import { Landmark, Gift, Heart, User, DollarSign, Calendar, RefreshCw } from 'lucide-react';

export default function Donations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [donorName, setDonorName] = useState('');
  const [cause, setCause] = useState('General Welfare Fund');
  const [customAmount, setCustomAmount] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDonations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      if (res.ok) {
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleSelectPreset = (amount: number) => {
    // DELIBERATE BUG: Preset amount string concatenation!
    // The junior developer sets customAmount state as a string.
    // If the user clicks $50, we set the input field to "50".
    // But in the submit handler, we accidentally concatenate "0" to it if it is a preset!
    // We'll write the logic in handleSubmit to append '0' if it matches the $50 preset!
    setCustomAmount(amount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitLoading(true);

    let finalAmount = parseFloat(customAmount);

    // DELIBERATE BUG: String concatenation bug on preset $50.
    // If the input value is "50", it gets concatenated as string "50" + "0" = "500",
    // resulting in a payment request of $500!
    if (customAmount === '50') {
      finalAmount = parseFloat(customAmount + '0'); // Concatenates string '50' + '0' -> '500' -> 500!
    }

    if (isNaN(finalAmount)) {
      setError('Please enter a valid donation amount.');
      setSubmitLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName,
          amount: finalAmount,
          cause,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Thank you, ${donorName}! Successfully processed donation of $${finalAmount}.`);
        setDonorName('');
        setCustomAmount('');
        loadDonations();
      } else {
        setError(data.error || 'Donation failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to donation server.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl flex items-center gap-2">
          <Landmark className="text-rose-500 w-8 h-8" /> Donations & Medical Funding
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-3xl">
          Track and support various rescue operations transparently. 100% of your contributions go directly to buying medical supplies, pet accessories, food, and paying for surgical procedures.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Donation Form - Column 5 */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold border-b border-zinc-150 dark:border-zinc-800 pb-3 flex items-center gap-2">
            💝 Make a Secure Donation
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-655 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-450 p-3.5 rounded-xl text-xs font-semibold">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Your Name / Organization</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Robert Vance"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Select Rescue Cause</label>
              <select
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="General Welfare Fund">General Welfare Fund</option>
                <option value="Medical Operations & Surgeries">Medical Operations & Surgeries</option>
                <option value="Pet Shop Food Supplies Sponsoring">Pet Shop Food Supplies Sponsoring</option>
                <option value="Buddy - Golden Retriever Care Fund">Buddy - Golden Retriever Care Fund</option>
              </select>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-550">Choose Quick Preset:</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleSelectPreset(amount)}
                    className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      customAmount === amount.toString()
                        ? 'bg-amber-500 border-amber-600 text-black'
                        : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Donation Amount ($ USD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
                <input
                  type="number"
                  required
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs transition duration-150 disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/10"
            >
              {submitLoading ? 'Processing Contribution...' : 'Submit Donation'}
            </button>
          </form>
        </div>

        {/* History List - Column 7 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="text-lg font-bold">Contribution History</h2>
            <button 
              onClick={loadDonations}
              className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading history...</div>
          ) : donations.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center py-12 rounded-2xl text-zinc-550">
              No donations recorded yet.
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-500">
                  <tr>
                    <th className="px-6 py-3">Donor</th>
                    <th className="px-6 py-3">Cause</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3">Date (Buggy!)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-805">
                  {donations.map((don) => {
                    // DELIBERATE BUG: Transaction list Date Bug!
                    // The junior developer parses 'don.dateCreated' instead of 'don.createdAt'.
                    // Since 'dateCreated' does not exist (is undefined), new Date(undefined) 
                    // returns an invalid date, rendering as "NaN/NaN/NaN" or "Invalid Date"!
                    const parsedDate = new Date(don.dateCreated);
                    const day = parsedDate.getDate();
                    const month = parsedDate.getMonth() + 1;
                    const year = parsedDate.getFullYear();
                    const displayDate = isNaN(day) ? 'NaN/NaN/NaN' : `${month}/${day}/${year}`;

                    return (
                      <tr key={don._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30">
                        <td className="px-6 py-4 font-bold" dangerouslySetInnerHTML={{ __html: don.donorName }} />
                        <td className="px-6 py-4 text-zinc-500">{don.cause}</td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-bold">${don.amount}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-rose-500 font-bold">{displayDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* QA Warning description */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/25 rounded-2xl space-y-2 text-xs">
        <h4 className="font-bold text-amber-500 flex items-center gap-1.5">
          💡 QA Testing Guide: Donation Portal Bugs
        </h4>
        <ul className="list-disc list-inside space-y-1 text-zinc-450 leading-relaxed">
          <li>
            <strong className="text-zinc-300">Preset Concatenation Bug:</strong> Click the <strong className="text-zinc-200">$50</strong> preset button. It sets the input value to 50. Now click <strong className="text-zinc-200">Submit Donation</strong>. The checkout amount processed is actually <strong className="text-rose-500">$500</strong>! (Test other presets to see if they behave correctly).
          </li>
          <li>
            <strong className="text-zinc-350">Invalid Timestamp Date:</strong> Check the date column in the Contribution History table. Every single date renders as <strong className="text-rose-500">NaN/NaN/NaN</strong> due to client-side property mismatch.
          </li>
        </ul>
      </div>
    </div>
  );
}
