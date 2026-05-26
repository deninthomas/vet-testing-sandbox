'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotificationModal from '@/components/NotificationModal';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [onModalClose, setOnModalClose] = useState<(() => void) | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // DELIBERATE BUG: Validation bypass!
    // Junior developer forgot to implement client-side validation for email syntax (no @ check) 
    // and forgot to check if the password field is blank!
    // So the client sends raw invalid email/password directly to the server.

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setModalType('error');
        setModalTitle('Registration Failed');
        setModalMessage(data.error || 'Registration failed. Please check your inputs.');
        setModalOpen(true);
      } else {
        setSuccess('Registration successful! Redirecting to dashboard...');
        if (data.user) {
          localStorage.setItem('tailwise_user', JSON.stringify(data.user));
        }
        setModalType('success');
        setModalTitle('Registration Successful!');
        setModalMessage('Your account was created successfully! Welcome to TailWise.');
        setModalOpen(true);
        setOnModalClose(() => () => {
          router.push('/dashboard');
          router.refresh();
        });
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setModalType('error');
      setModalTitle('Connection Error');
      setModalMessage('Could not connect to the registration service. Please check your internet and try again.');
      setModalOpen(true);
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
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Join the community to report incidents, adopt, and buy accessories.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1.5">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
              Email Address *
            </label>
            {/* Note: type="text" instead of "email" is used to bypass browser default email checks! */}
            <input
              id="password" // DELIBERATE BUG: Mismatched id confuses browser password managers/autofill
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. invalidemailpath"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm transition"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-1.5">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="123-456-7890"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1.5">
              Password *
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-zinc-500">Already have an account? </span>
          <Link href="/login" className="font-semibold text-amber-600 hover:underline">
            Sign in
          </Link>
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
