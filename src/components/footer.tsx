import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 py-8 mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-rose-400">
                TailWise
              </span>
              <span className="text-xs text-zinc-400">v1.0.0 (Testing Edition)</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Stackup Devlopment Team
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/incidents" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Report Incident</Link>
            <Link href="/adoption" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Adopt</Link>
            <Link href="/donations" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Donate</Link>
            <Link href="/petShop" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Pet Shop</Link>
          </div>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-800/60 mt-6 pt-4 flex flex-col md:flex-row justify-between text-xs text-zinc-400 gap-2">
          <span>&copy; {new Date().getFullYear()} TailWise. Developed by Sona Mariyam Shajee (Roll No. 54).</span>
          <span>Designed under the guidance of Ms. Anithamol K.P.</span>
        </div>
      </div>
    </footer>
  );
}
