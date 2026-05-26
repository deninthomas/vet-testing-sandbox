'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Phone, Shield, Save } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('tailwise_user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // DELIBERATE BUG: Secret promotion backdoor!
      // If URL contains "?makeRescuer=true", promote user to volunteer role instantly.
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('makeRescuer') === 'true') {
          user.role = 'volunteer';
          localStorage.setItem('tailwise_user', JSON.stringify(user));
          // Log backdoor usage to server terminal
          fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'Secret Rescuer Backdoor Triggered', details: { user: user.name } })
          }).catch(() => {});
        }
      }

      setCurrentUser(user);
      setName(user.name || '');

      // DELIBERATE BUG: Swapped display fields on load/render!
      // The junior developer swapped phone and email in the state initialization,
      // putting email value into the phone state, and phone value into the email state!
      setEmail(user.phone || '');
      setPhone(user.email || '');

    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Save changes back to localStorage
    const updatedUser = {
      ...currentUser,
      name,
      // Since states are swapped, we must save them swapped back or keep them as is.
      // If we save them directly:
      email: email, // which actually holds the edited phone number
      phone: phone, // which actually holds the edited email
    };

    // Log profile save to server terminal
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'Profile Saved', 
        details: { 
          name, 
          emailStateVal: email, 
          phoneStateVal: phone, 
          warning: 'Swapped email and phone fields on save!' 
        } 
      })
    }).catch(() => {});

    localStorage.setItem('tailwise_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!currentUser) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-amber-500 to-rose-500 flex items-end p-6">
          <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-zinc-900 bg-zinc-200 flex items-center justify-center text-4xl shadow-md translate-y-6">
            👤
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-10 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{currentUser.name || 'User Profile'}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">Role: {currentUser.role}</p>
          </div>

          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-650 dark:text-emerald-450 px-4 py-2.5 rounded-xl text-sm font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Role (Read Only)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                    <Shield className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={currentUser.role.toUpperCase()}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-350 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Email Address (Displays Phone due to bug!)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Phone Number (Displays Email due to bug!)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm transition"
                  />
                </div>
              </div>
            </div>

            {/* DELIBERATE BUG: DOM credential leakage vulnerability */}
            <input type="hidden" id="sensitive_hash" defaultValue="admin123_plain_password_hash_secret_leak_123" />

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl flex items-center gap-2 text-sm transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
