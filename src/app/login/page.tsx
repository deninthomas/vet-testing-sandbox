'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
      } else {
        localStorage.setItem('tailwise_user', JSON.stringify(data.user));
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center text-white text-xl">
            🐾
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight">
            Welcome back to TailWise
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to report incidents, adopt pets, or manage your shop.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm transition"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <div className="text-center text-sm">
            <span className="text-zinc-500">Don&apos;t have an account? </span>
            <Link href="/register" className="font-semibold text-amber-600 hover:underline">
              Register now
            </Link>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="font-bold flex items-center gap-1 text-zinc-700 dark:text-zinc-300 mb-1">
            <Shield className="w-3.5 h-3.5" /> QA Sandbox Hint:
          </div>
          <p className="text-zinc-500">You can use these default credentials to test user roles:</p>
          <ul className="list-disc list-inside mt-1 font-mono text-[11px] text-zinc-550 space-y-0.5">
            <li>Admin: <span className="text-amber-600">admin@tailwise.org</span> / adminpassword</li>
            <li>Volunteer: <span className="text-amber-600">volunteer@tailwise.org</span> / volunteerpassword</li>
            <li>User: <span className="text-amber-600">user@tailwise.org</span> / userpassword</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
