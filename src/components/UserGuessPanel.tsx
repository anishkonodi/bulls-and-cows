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
    <div className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col ${disabled ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-white border-indigo-100 shadow-md shadow-indigo-50'}`}>
      <div className="flex justify-between items-center mb-1 sm:mb-2 shrink-0">
        <h3 className="text-base sm:text-xl font-bold text-slate-800">Your Turn</h3>
        {lastResult && (
           <div className="flex gap-2 text-xs sm:hidden">
              <span className="font-bold text-indigo-700">D: {lastResult.digits}</span>
              <span className="font-bold text-indigo-700">P: {lastResult.positions}</span>
           </div>
        )}
      </div>
      <p className="hidden sm:block text-slate-500 text-sm mb-2 sm:mb-3 shrink-0">Guess the system's secret 4-digit number.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-3 flex-1">
        <div className="flex-1">
          <label htmlFor="user-guess" className="hidden sm:block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
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
            className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-lg sm:text-xl tracking-[0.25em] sm:tracking-[0.5em] text-center"
          />
          {error && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-500 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={disabled || guess.length !== 4}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-2 sm:py-2 rounded-lg transition-colors shadow-sm shadow-indigo-100 uppercase tracking-wide text-xs sm:text-sm shrink-0"
        >
          Submit Guess
        </button>
      </form>

      {lastResult && (
        <div className="hidden sm:flex mt-3 pt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 justify-around shrink-0">
          <div className="text-center">
            <span className="block text-2xl font-bold text-indigo-700">{lastResult.digits}</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Matched Digits</span>
          </div>
          <div className="h-10 w-px bg-indigo-200 mt-1"></div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-indigo-700">{lastResult.positions}</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Matched Positions</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGuessPanel;
