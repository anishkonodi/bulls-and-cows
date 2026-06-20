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
    <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full min-h-0">
      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-4 shrink-0">{title} History</h3>
      <div className="overflow-x-auto overflow-y-auto sm:overflow-y-visible flex-1 min-h-0">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] sm:text-xs font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-1 sm:px-4 py-2 sm:py-3 rounded-l-lg text-center">Guess</th>
              <th className="px-1 sm:px-4 py-2 sm:py-3 text-center" title="Matched Digits">D</th>
              <th className="px-1 sm:px-4 py-2 sm:py-3 rounded-r-lg text-center" title="Matched Positions">P</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-2 sm:px-4 py-4 sm:py-8 text-center text-slate-400 italic">
                  Empty
                </td>
              </tr>
            ) : (
              [...history].reverse().map((record, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-1 sm:px-4 py-1.5 sm:py-3 font-mono text-center text-slate-700 font-bold">{record.guess}</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-3 text-center">
                    <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 px-1 sm:px-2 py-0.5 rounded-full font-bold min-w-[20px] sm:min-w-[24px]">
                      {record.digits}
                    </span>
                  </td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-3 text-center">
                    <span className="inline-flex items-center justify-center bg-orange-100 text-orange-700 px-1 sm:px-2 py-0.5 rounded-full font-bold min-w-[20px] sm:min-w-[24px]">
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
