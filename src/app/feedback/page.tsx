'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, Trash, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('5');
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadFeedbacks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (res.ok) {
        setFeedbacks(data.feedbacks || []);
      } else {
        setError(data.error || 'Failed to load feedback logs.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          comment,
          rating: Number(rating),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Submission failed.');
      } else {
        setMessage('Feedback submitted successfully!');
        setUserName('');
        setComment('');
        setRating('5');
        loadFeedbacks();
      }
    } catch (err: any) {
      console.error(err);
      setError('API connection crash: ' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl flex items-center gap-2">
          <MessageSquare className="text-rose-500 w-8 h-8" /> Community Feedback & Review Logs
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-3xl">
          Leave reviews on rescue events, veterinary services, or animal accessories purchased from our pet shop. We use your comments to continuously refine operations.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Form - Column 5 */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold border-b border-zinc-150 dark:border-zinc-800 pb-3 flex items-center gap-2">
            ✍️ Leave Your Feedback
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 p-4 rounded-xl text-xs font-mono max-h-48 overflow-y-auto">
              <div className="font-bold flex items-center gap-1 text-red-500 mb-1">
                <ShieldAlert className="w-4 h-4 shrink-0" /> ERROR ENCOUNTERED (500)
              </div>
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-450 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-550" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Rating Star Count (Bypasses range validation!)
              </label>
              {/* Type text allows entering numbers like 15 or -3! */}
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="e.g. 15 or -2"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs font-mono focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Comments *</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here. Type 'crash' to trigger 500 error or use 'bad' to see the censorship swap."
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition duration-150 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/10"
            >
              {submitLoading ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* List - Column 7 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="text-lg font-bold">Recent Reviews</h2>
            <button 
              onClick={loadFeedbacks}
              className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 rounded-lg text-zinc-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading reviews...</div>
          ) : feedbacks.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center py-12 rounded-2xl text-zinc-500 italic">
              No feedback comments submitted yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {feedbacks.map((fb) => (
                <div key={fb._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-zinc-850 dark:text-zinc-200">{fb.userName}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-mono font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 shrink-0" />
                      <span>{fb.rating} Stars</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                    &ldquo;{fb.comment}&rdquo;
                  </p>
                  <div className="text-[10px] text-zinc-400 text-right font-mono">
                    Logged: {new Date(fb.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QA Warning description */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/25 rounded-2xl space-y-2 text-xs">
        <h4 className="font-bold text-amber-500 flex items-center gap-1.5">
          💡 QA Testing Guide: Feedback Module Bugs
        </h4>
        <ul className="list-disc list-inside space-y-1.5 text-zinc-450 leading-relaxed">
          <li>
            <strong className="text-zinc-300">Rating Range Bug:</strong> In the rating star input, type <strong className="text-zinc-200">15</strong> or <strong className="text-zinc-200">-3</strong> and submit. It gets logged successfully on the dashboard, violating the standard 1-5 limits.
          </li>
          <li>
            <strong className="text-zinc-300">Censorship logical bug:</strong> Submit feedback containing the word <strong className="text-zinc-200">&quot;bad&quot;</strong> (e.g. &quot;This app rescue response time is very bad&quot;). Notice that when displayed in the logs, it automatically reads as <strong className="text-rose-500">&quot;This app rescue response time is very excellent&quot;</strong>!
          </li>
          <li>
            <strong className="text-zinc-300">Crash Trigger Bug:</strong> Write the word <strong className="text-zinc-200">&quot;crash&quot;</strong> inside the comment text area and submit. The server API throws a 500 error simulating a processor crash.
          </li>
        </ul>
      </div>
    </div>
  );
}
