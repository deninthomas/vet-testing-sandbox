'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, Activity, ShoppingBag, Landmark, Shield, User as UserIcon, LifeBuoy, Wrench, Menu, X, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);

  useEffect(() => {
    // Read session from localStorage
    const userStr = localStorage.getItem('tailwise_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        setCurrentUser(null);
      }
    }
    // Log page navigation to server terminal
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'Page Navigated', details: { path: pathname } })
    }).catch(() => {});
  }, [pathname]);

  const handleLogout = () => {
    // Log logout to server terminal
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'Logout Action Triggered', details: { user: currentUser } })
    }).catch(() => {});

    // DELIBERATE BUG: Clears all local storage keys instead of just user session
    localStorage.clear();
    setCurrentUser(null);
    router.push('/login');
    router.refresh();
  };

  const handleSandboxRoleSwitch = (role: 'guest' | 'user' | 'volunteer' | 'admin') => {
    // Log role switch to server terminal
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'Sandbox Role Switched', details: { newRole: role } })
    }).catch(() => {});

    if (role === 'guest') {
      localStorage.removeItem('tailwise_user');
      setCurrentUser(null);
    } else {
      const mockUser = {
        name: role === 'user' ? 'John Doe' : role === 'volunteer' ? 'Jane Volunteer' : 'Alice Admin',
        email: `${role}@tailwise.org`,
        role: role,
      };
      localStorage.setItem('tailwise_user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
    }
    setIsMenuOpen(false);
    router.refresh();
  };

  const resetMockDatabase = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        alert('Mock database reset to default values!');
        router.refresh();
        window.location.reload();
      } else {
        alert('Failed to reset database.');
      }
    } catch (err) {
      console.error(err);
      alert('Error resetting database.');
    }
  };

  const navItems = [
    { name: 'Incidents', href: '/incidents', icon: Activity },
    { name: 'Adoption', href: '/adoption', icon: Heart },
    { name: 'Donations', href: '/donations', icon: Landmark },
    { name: 'Veterinary', href: '/veterinary', icon: LifeBuoy },
    { name: 'Pet Shop', href: '/petShop', icon: ShoppingBag },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      {/* Testing Sandbox Banner */}
      <div className="bg-amber-500 text-black text-xs font-semibold px-4 py-1.5 flex justify-between items-center select-none shadow-inner">
        <div className="flex items-center gap-2">
          <span className="bg-black text-amber-500 text-[10px] px-1.5 py-0.5 rounded font-mono">QA SANDBOX</span>
          <span>TailWise is running in testing mode with deliberate bugs.</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSandbox(!showSandbox)}
            className="flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Wrench className="w-3 h-3" /> {showSandbox ? 'Hide Panel' : 'Show Panel'}
          </button>
          <button 
            onClick={resetMockDatabase}
            className="hover:bg-amber-600 px-2 py-0.5 rounded bg-amber-600/30 cursor-pointer"
          >
            Reset DB
          </button>
        </div>
      </div>

      {/* Sandbox Toggle Panel */}
      {showSandbox && (
        <div className="bg-zinc-900 text-white p-4 border-b border-zinc-800 text-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> Quick Role Switcher
              </h4>
              <p className="text-xs text-zinc-400 mt-1">Simulate authorization levels instantly to check page access and test for bugs.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleSandboxRoleSwitch('guest')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${!currentUser ? 'bg-amber-500 text-black' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              >
                Guest (Logged Out)
              </button>
              <button 
                onClick={() => handleSandboxRoleSwitch('user')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${currentUser?.role === 'user' ? 'bg-amber-500 text-black' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              >
                User
              </button>
              <button 
                onClick={() => handleSandboxRoleSwitch('volunteer')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${currentUser?.role === 'volunteer' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              >
                Volunteer
              </button>
              <button 
                onClick={() => handleSandboxRoleSwitch('admin')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${currentUser?.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              >
                Admin
              </button>
            </div>
            <div className="text-xs border-l border-zinc-700 pl-4">
              <div className="font-semibold text-zinc-300">Active Session:</div>
              <div className="text-amber-400 font-mono mt-0.5">
                {currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'Anonymous Guest'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                🐾
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-rose-400">
                TailWise
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 dark:bg-zinc-900 dark:text-amber-400'
                      : 'text-zinc-600 hover:text-amber-600 dark:text-zinc-300 dark:hover:text-amber-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}

            {/* Volunteer Dashboard Access */}
            {(currentUser?.role === 'volunteer' || currentUser?.role === 'admin') && (
              <Link
                href="/volunteer"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/volunteer')
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450'
                    : 'text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400'
                }`}
              >
                <Shield className="w-4 h-4" />
                Volunteer Portal
              </Link>
            )}

            {/* Admin Dashboard Access */}
            {currentUser?.role === 'admin' && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                    : 'text-zinc-600 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* User Dashboard Access */}
            {currentUser?.role === 'user' && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard')
                    ? 'bg-amber-50 text-amber-700 dark:bg-zinc-900 dark:text-amber-400'
                    : 'text-zinc-600 hover:text-amber-600 dark:text-zinc-300 dark:hover:text-amber-400'
                }`}
              >
                <Shield className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Account / Login */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 text-sm font-medium px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm hover:shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.name === 'Adoption' ? '/Adoption' : item.href} // DELIBERATE BUG: Mismatched case sensitivity route
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-700 hover:text-amber-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              {item.name}
            </Link>
          ))}
          {(currentUser?.role === 'volunteer' || currentUser?.role === 'admin') && (
            <Link
              href="/volunteer"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-zinc-900"
            >
              Volunteer Portal
            </Link>
          )}
          {currentUser?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-zinc-900"
            >
              Admin Dashboard
            </Link>
          )}
          {currentUser?.role === 'user' && (
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-600 hover:bg-amber-55 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-zinc-900"
            >
              Dashboard
            </Link>
          )}
          <hr className="border-zinc-200 dark:border-zinc-800 my-2" />
          {currentUser ? (
            <div className="space-y-2">
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-700 hover:text-amber-600 dark:text-zinc-300 hover:bg-zinc-50"
              >
                Profile settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-center px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="text-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
