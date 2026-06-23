import React, { useState } from 'react';
import { validateGuess } from '@/src/lib/numberUtils';

interface UserGuessPanelProps {
  onGuess: (guess: string) => void;
  disabled: boolean;
  lastResult?: { positions: number; digits: number };
}

const UserGuessPanel: React.FC<UserGuessPanelProps> = ({ onGuess, disabled, lastResult }) => {
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateGuess(guess)) {
      setError('Please enter a 4-digit number.');
      return;
    }
    setError('');
    onGuess(guess);
    setGuess('');
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col ${disabled ? 'bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/40 opacity-40 shadow-none' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-1.5 sm:mb-3 shrink-0">
        <h3 className={`text-base sm:text-xl font-bold tracking-tight ${disabled ? 'text-slate-400' : 'text-slate-800 dark:text-indigo-400'}`}>Your Turn</h3>
        {lastResult && (
           <div className="flex gap-2 text-xs sm:hidden">
              <span className="font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20">D: {lastResult.digits}</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20">P: {lastResult.positions}</span>
           </div>
        )}
      </div>
      <p className="hidden sm:block text-slate-500 dark:text-slate-400 text-sm mb-2 sm:mb-3 shrink-0">Guess the system&apos;s secret 4-digit number.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-3 flex-1">
        <div className="flex-1">
          <label htmlFor="user-guess" className="hidden sm:block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
            Enter 4-Digit Guess
          </label>
          <input
            id="user-guess"
            type="text"
            maxLength={4}
            value={guess}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setGuess(val);
              if (error) setError('');
            }}
            disabled={disabled}
            placeholder="e.g. 1234"
            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono text-lg sm:text-xl tracking-[0.25em] sm:tracking-[0.5em] text-center text-slate-900 dark:text-white"
          />
          {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={disabled || guess.length !== 4}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-450 dark:disabled:text-slate-500 text-white font-bold py-2 sm:py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] uppercase tracking-wide text-xs sm:text-sm shrink-0 cursor-pointer"
        >
          Submit Guess
        </button>
      </form>

      {lastResult && (
        <div className="hidden sm:flex mt-4 pt-4 p-3 bg-indigo-50/40 dark:bg-slate-950/40 rounded-xl border border-indigo-100/60 dark:border-slate-850 justify-around shrink-0">
          <div className="text-center">
            <span className="block text-2xl font-bold text-indigo-700 dark:text-indigo-400">{lastResult.digits}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-tighter">Matched Digits</span>
          </div>
          <div className="h-10 w-px bg-indigo-200 dark:bg-slate-800 mt-1"></div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-indigo-700 dark:text-indigo-400">{lastResult.positions}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-tighter">Matched Positions</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGuessPanel;

