'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Heart, Activity, Calendar, Trash, Plus, Check, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'animals' | 'reports'>('users');
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [animalsList, setAnimalsList] = useState<any[]>([]);
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  
  // New Animal Form
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('Dog');
  const [newAnimalBreed, setNewAnimalBreed] = useState('');
  const [newAnimalAge, setNewAnimalAge] = useState('');
  const [newAnimalHealth, setNewAnimalHealth] = useState('Healthy');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users, animals, incidents
      const incRes = await fetch('/api/incidents');
      const incData = await incRes.json();
      setIncidentsList(incData.incidents || []);

      const adoptRes = await fetch('/api/adoption');
      const adoptData = await adoptRes.json();
      setAnimalsList(adoptData.animals || []);

      // Simulating user list fetch (fallback mock DB has users)
      // We can create a simple endpoint or fetch mock directly
      const usersRes = await fetch('/api/auth/users'); // we will implement this API or fallback
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData.users || []);
      } else {
        // Fallback for user list if API not ready
        setUsersList([
          { _id: 'u1', name: 'John Doe', email: 'user@tailwise.org', phone: '1234567890', role: 'user' },
          { _id: 'u2', name: 'Jane Volunteer', email: 'volunteer@tailwise.org', phone: '9876543210', role: 'volunteer' },
          { _id: 'u3', name: 'Alice Admin', email: 'admin@tailwise.org', phone: '5551234567', role: 'admin' },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if admin
    const userStr = localStorage.getItem('tailwise_user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadData();
  }, [router]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user account?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/auth/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('User account deleted.');
        loadData();
      } else {
        setError('Failed to delete user.');
      }
    } catch {
      setError('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAnimalName,
          species: newAnimalSpecies,
          breed: newAnimalBreed,
          age: newAnimalAge,
          healthStatus: newAnimalHealth,
          temperament: 'Friendly, active',
          imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=60'
        }),
      });

      if (res.ok) {
        setMessage('New animal listing created!');
        setNewAnimalName('');
        setNewAnimalBreed('');
        setNewAnimalAge('');
        loadData();
      } else {
        setError('Failed to add animal.');
      }
    } catch {
      setError('Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 text-white p-8 rounded-2xl border border-zinc-850 shadow-md">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-sm tracking-wider uppercase">
            <Shield className="w-5 h-5" /> Admin Controller Board
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Administration Panel</h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Global management dashboard. Manage registered accounts, create animal listings, oversee rescue reports, and verify transaction pipelines.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Dashboard
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-450 px-4 py-2.5 rounded-xl text-xs font-medium">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-bold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" /> User Management
        </button>
        <button
          onClick={() => setActiveTab('animals')}
          className={`px-6 py-3 font-bold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === 'animals'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Heart className="w-4 h-4" /> Animal Profiles
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-bold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === 'reports'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Incident Reports
        </button>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-sm">Loading admin datasets...</div>
      ) : (
        <div className="space-y-6">
          {/* Tab 1: Users */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-500">
                  <tr>
                    <th className="px-6 py-3">User ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">System Role</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-805">
                  {usersList.map((user) => (
                    <tr key={user._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30">
                      <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">{user._id}</td>
                      <td className="px-6 py-4 font-bold">{user.name}</td>
                      <td className="px-6 py-4 text-zinc-500">{user.email}</td>
                      <td className="px-6 py-4 text-zinc-500">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          disabled={actionLoading}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            setActionLoading(true);
                            setError('');
                            setMessage('');
                            try {
                              const res = await fetch('/api/auth/users', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: user._id, role: newRole })
                              });
                              if (res.ok) {
                                setMessage(`Role update command sent for user ID: ${user._id}.`);
                                loadData();
                              } else {
                                const errData = await res.json();
                                setError(errData.error || 'Failed to update role.');
                              }
                            } catch {
                              setError('Connection error.');
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          className="bg-transparent dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-1.5 py-0.5 text-[11px] font-semibold focus:outline-none"
                        >
                          <option value="user">USER</option>
                          <option value="volunteer">VOLUNTEER</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={actionLoading || user.role === 'admin'}
                          className="text-red-500 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash className="w-4 h-4 inline-block" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Animals */}
          {activeTab === 'animals' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Form to Add Animal */}
              <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="font-bold text-sm border-b border-zinc-150 dark:border-zinc-800 pb-2 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Rescued Animal Listing
                </h3>
                <form onSubmit={handleCreateAnimal} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={newAnimalName}
                      onChange={(e) => setNewAnimalName(e.target.value)}
                      placeholder="Buddy"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Species</label>
                      <select
                        value={newAnimalSpecies}
                        onChange={(e) => setNewAnimalSpecies(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:outline-none"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Breed</label>
                      <input
                        type="text"
                        value={newAnimalBreed}
                        onChange={(e) => setNewAnimalBreed(e.target.value)}
                        placeholder="Retriever mix"
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Age</label>
                      <input
                        type="text"
                        value={newAnimalAge}
                        onChange={(e) => setNewAnimalAge(e.target.value)}
                        placeholder="2 years"
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Health Status</label>
                      <input
                        type="text"
                        value={newAnimalHealth}
                        onChange={(e) => setNewAnimalHealth(e.target.value)}
                        placeholder="Healthy"
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    Add Animal Listing
                  </button>
                </form>
              </div>

              {/* Animals Table */}
              <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-500">
                    <tr>
                      <th className="px-6 py-3">Photo</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Species/Breed</th>
                      <th className="px-6 py-3">Age</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-805">
                    {animalsList.map((animal) => (
                      <tr key={animal._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30">
                        <td className="px-6 py-3 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={animal.imageUrl} alt={animal.name} className="w-10 h-10 object-cover rounded-lg border border-zinc-200" />
                        </td>
                        <td className="px-6 py-4 font-bold">{animal.name}</td>
                        <td className="px-6 py-4 text-zinc-500">{animal.species} &bull; {animal.breed || 'N/A'}</td>
                        <td className="px-6 py-4 text-zinc-400 font-mono">{animal.age}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            animal.status === 'adopted'
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {animal.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Incidents */}
          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-500">
                  <tr>
                    <th className="px-6 py-3">Report ID</th>
                    <th className="px-6 py-3">Reporter</th>
                    <th className="px-6 py-3">Animal</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-805">
                  {incidentsList.map((inc) => (
                    <tr key={inc._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30">
                      <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">{inc._id}</td>
                      <td className="px-6 py-4 font-bold">{inc.reporterName} ({inc.reporterPhone})</td>
                      <td className="px-6 py-4 text-zinc-500">{inc.animalType}</td>
                      <td className="px-6 py-4 text-zinc-500">{inc.location || 'EMPTY (Bug!)'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          inc.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
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
      )}
    </div>
  );
}
