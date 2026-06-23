import React, { useState } from 'react';

interface SystemGuessPanelProps {
  systemGuess: string | null;
  onFeedback: (positions: number, digits: number) => void;
  disabled: boolean;
  error?: string;
}

const SystemGuessPanel: React.FC<SystemGuessPanelProps> = ({ systemGuess, onFeedback, disabled, error: externalError }) => {
  const [positions, setPositions] = useState<string>('');
  const [digits, setDigits] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(positions);
    const d = parseInt(digits);

    if (isNaN(p) || isNaN(d)) {
      setError('Please enter Matched Positions and Matched Digits.');
      return;
    }

    if (p > d) {
      setError('Matched Positions cannot exceed total Matched Digits.');
      return;
    }

    if (d > 4) {
      setError('Total Matched Digits cannot exceed 4.');
      return;
    }

    onFeedback(p, d);
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col ${disabled ? 'bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/40 opacity-40 shadow-none' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-1.5 sm:mb-3 shrink-0">
        <h3 className={`text-base sm:text-lg font-bold tracking-tight ${disabled ? 'text-slate-400' : 'text-slate-800 dark:text-orange-400'}`}>System&apos;s Turn</h3>
        <span className="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-[8px] sm:text-[9px] font-bold px-2.5 py-1 rounded border border-orange-200 dark:border-orange-500/20 uppercase tracking-widest">Opponent</span>
      </div>
      <p className="hidden sm:block text-slate-500 dark:text-slate-400 text-xs mb-3 shrink-0">The system is trying to guess your secret number.</p>

      {systemGuess ? (
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex sm:flex-col items-center justify-between sm:justify-center p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl shadow-inner border border-slate-200 dark:border-slate-850 shrink-0">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider sm:mb-1.5">System Guess</span>
            <span className="text-2xl sm:text-4xl font-mono font-black text-slate-900 dark:text-white tracking-[0.1em] sm:tracking-[0.3em]">{systemGuess}</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
             <div className="flex gap-2 sm:flex-col sm:gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 line-clamp-1">Matched Digits</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={digits}
                    onChange={(e) => {
                      setDigits(e.target.value);
                      if (error) setError('');
                    }}
                    disabled={disabled}
                    className="w-full px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-center text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                    placeholder="0-4"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 line-clamp-1">Matched Positions</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={positions}
                    onChange={(e) => {
                      setPositions(e.target.value);
                      if (error) setError('');
                    }}
                    disabled={disabled}
                    className="w-full px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 focus:bg-white dark:focus:bg-slate-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-center text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                    placeholder="0-4"
                  />
                </div>
            </div>

            {externalError && <p className="text-xs text-red-650 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-500/10 p-2.5 rounded-xl border border-red-200 dark:border-red-500/20">{externalError}</p>}
            {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={disabled || positions === '' || digits === ''}
              className="mt-auto w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] uppercase tracking-wide text-xs sm:text-sm shrink-0 cursor-pointer"
            >
              Confirm Feedback
            </button>
          </form>
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs italic tracking-wider">
          Waiting for system to calculate...
        </div>
      )}
    </div>
  );
};

export default SystemGuessPanel;

