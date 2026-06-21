'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Unhandled Application Exception:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-100 shadow-xl text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          ⚠️
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Something went wrong!</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          An unexpected error occurred in the application. We apologize for the inconvenience. 
          No database details, tokens, or configuration secrets have been exposed.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md text-sm cursor-pointer border-none"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all border border-slate-200 text-sm text-center"
          >
            Back to Game
          </Link>
        </div>
      </div>
    </main>
  );
}
