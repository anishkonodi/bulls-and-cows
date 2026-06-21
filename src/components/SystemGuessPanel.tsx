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
    <div className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col ${disabled ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-white border-orange-100 shadow-md shadow-orange-50'}`}>
      <div className="flex justify-between items-center mb-1 sm:mb-2 shrink-0">
        <h3 className="text-base sm:text-xl font-bold text-slate-800">System&apos;s Turn</h3>
        <span className="bg-orange-100 text-orange-700 text-[8px] sm:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Opponent</span>
      </div>
      <p className="hidden sm:block text-slate-500 text-sm mb-3 shrink-0">The system is trying to guess your secret number.</p>

      {systemGuess ? (
        <div className="flex flex-col gap-2 sm:space-y-4 flex-1">
          <div className="flex sm:flex-col items-center justify-between sm:justify-center p-3 sm:p-3 bg-slate-900 rounded-xl shadow-inner shrink-0">
            <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-[0.1em] sm:tracking-[0.2em] sm:mb-1">System Guess</span>
            <span className="text-2xl sm:text-5xl font-mono font-black text-white tracking-[0.1em] sm:tracking-[0.3em]">{systemGuess}</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:space-y-3 flex-1">
             <div className="flex gap-2 sm:flex-col sm:space-y-3">
                <div className="flex-1">
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-tight sm:tracking-wider mb-1 line-clamp-1">Matched Digits</label>
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
                    className="w-full px-2 py-2 sm:px-4 sm:py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-center text-base sm:text-lg font-bold"
                    placeholder="0-4"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-tight sm:tracking-wider mb-1 line-clamp-1">Matched Positions</label>
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
                    className="w-full px-2 py-2 sm:px-4 sm:py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-center text-base sm:text-lg font-bold"
                    placeholder="0-4"
                  />
                </div>
            </div>

            {externalError && <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100">{externalError}</p>}
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={disabled || positions === '' || digits === ''}
              className="mt-auto w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-2 sm:py-2 rounded-lg transition-colors shadow-sm shadow-orange-100 uppercase tracking-wide text-xs sm:text-sm shrink-0"
            >
              Confirm Feedback
            </button>
          </form>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 italic">
          Waiting for system to calculate...
        </div>
      )}
    </div>
  );
};

export default SystemGuessPanel;
