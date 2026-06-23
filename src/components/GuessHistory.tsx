import React from 'react';

export interface GuessRecord {
  guess: string;
  positions: number;
  digits: number;
}

interface GuessHistoryProps {
  history: GuessRecord[];
  title: string;
}

const GuessHistory: React.FC<GuessHistoryProps> = ({ history, title }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl flex flex-col h-full min-h-0">
      <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider mb-3 sm:mb-4 shrink-0">{title} History</h3>
      <div className="overflow-x-auto overflow-y-auto sm:overflow-y-visible flex-1 min-h-0">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase text-[10px] sm:text-xs font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-850">
            <tr>
              <th className="px-3 py-2 sm:py-2.5 rounded-l-lg text-center">Guess</th>
              <th className="px-3 py-2 sm:py-2.5 text-center" title="Matched Digits">D</th>
              <th className="px-3 py-2 sm:py-2.5 rounded-r-lg text-center" title="Matched Positions">P</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
            {history.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-2 py-8 sm:py-10 text-center text-slate-400 dark:text-slate-500 italic text-xs tracking-wide">
                  Empty
                </td>
              </tr>
            ) : (
              [...history].reverse().map((record, index) => (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors">
                  <td className="px-3 py-2 sm:py-2.5 font-mono text-center text-slate-700 dark:text-white font-bold tracking-wider">{record.guess}</td>
                  <td className="px-3 py-2 sm:py-2.5 text-center">
                    <span className="inline-flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-bold min-w-[20px] sm:min-w-[24px] border border-indigo-150 dark:border-indigo-500/25">
                      {record.digits}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:py-2.5 text-center">
                    <span className="inline-flex items-center justify-center bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-md font-bold min-w-[20px] sm:min-w-[24px] border border-orange-150 dark:border-orange-500/25">
                      {record.positions}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuessHistory;

