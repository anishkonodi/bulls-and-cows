'use client';

import React, { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  gamesPlayed: number;
  gamesWon: number;
  totalAttempts: number;
  bestAttempts: number | null;
  updatedAt: Date | string;
}

interface LeaderboardEntry {
  id: string;
  attempts: number;
  durationSeconds: number | null;
  startedAt: Date | string;
  user: {
    name: string | null;
    email: string;
  };
}

interface Metrics {
  totalUsers: number;
  totalGames: number;
  totalWins: number;
  averageAttempts: number;
  averageGameDuration: number;
  dailyActiveUsers: number;
}

interface AdminDashboardClientProps {
  metrics: Metrics;
  users: User[];
  leaderboard: LeaderboardEntry[];
}

const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  metrics,
  users,
  leaderboard,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'leaderboard'>('users');
  const [userQuery, setUserQuery] = useState('');

  // Pagination State (10 items per page)
  const [usersPage, setUsersPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  
  const ITEMS_PER_PAGE = 10;

  // Filter users by name or email
  const filteredUsers = users.filter((user) => {
    const term = userQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(term);
    const emailMatch = user.email.toLowerCase().includes(term);
    return nameMatch || emailMatch;
  });

  // Paginated Slices
  const totalUsersItems = filteredUsers.length;
  const usersStart = (usersPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(usersStart, usersStart + ITEMS_PER_PAGE);

  const totalLeaderboardItems = leaderboard.length;
  const leaderboardStart = (leaderboardPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeaderboard = leaderboard.slice(leaderboardStart, leaderboardStart + ITEMS_PER_PAGE);

  const renderPagination = (
    currentPage: number,
    totalItems: number,
    setPage: (page: number) => void
  ) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sm:px-6 shrink-0 select-none">
        {/* Mobile pagination controls */}
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="relative inline-flex items-center px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:bg-slate-900 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 self-center">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="relative inline-flex items-center px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:bg-slate-900 transition-colors"
          >
            Next
          </button>
        </div>
        
        {/* Desktop pagination controls */}
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}</span> to{' '}
              <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of{' '}
              <span className="font-semibold">{totalItems}</span> items
            </p>
          </div>
          <div>
            <nav className="inline-flex gap-1" aria-label="Pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="relative inline-flex items-center px-2.5 py-1.5 text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:bg-slate-900 transition-colors"
              >
                <span className="sr-only">Previous</span>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              
              {pages.map((pageNum) => {
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`relative inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      isCurrent
                        ? 'z-10 bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="relative inline-flex items-center px-2.5 py-1.5 text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:bg-slate-900 transition-colors"
              >
                <span className="sr-only">Next</span>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{metrics.totalUsers}</h3>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-4 flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            {metrics.dailyActiveUsers} Active Today
          </div>
        </div>

        {/* Total Games */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Games</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{metrics.totalGames}</h3>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-4">
            {metrics.totalWins} Wins ({metrics.totalGames > 0 ? Math.round((metrics.totalWins / metrics.totalGames) * 100) : 0}% Win Rate)
          </p>
        </div>

        {/* Average Attempts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Avg Attempts</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">
              {metrics.averageAttempts ? metrics.averageAttempts.toFixed(1) : 'N/A'}
            </h3>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-4">Per completed session</p>
        </div>

        {/* Avg Duration */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Avg Game Duration</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">
              {metrics.averageGameDuration ? `${Math.round(metrics.averageGameDuration)}s` : 'N/A'}
            </h3>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-4">Fastest: {leaderboard.length > 0 ? `${leaderboard[0].durationSeconds}s` : 'N/A'}</p>
        </div>

      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white dark:text-slate-100'}`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeTab === 'leaderboard' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white dark:text-slate-100'}`}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* TAB 1: Users Directory */}
        {activeTab === 'users' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                  setUsersPage(1);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
                    <th className="px-4 py-3 rounded-l-lg">User</th>
                    <th className="px-4 py-3 text-center">Played / Won</th>
                    <th className="px-4 py-3 text-center">Best Record</th>
                    <th className="px-4 py-3 rounded-r-lg">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No users found.</td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors">
                        <td className="px-4 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{user.name || "Anonymous"}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-200">
                          {user.gamesPlayed} / {user.gamesWon}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {user.bestAttempts ? (
                            <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-xs">
                              {user.bestAttempts} attempts
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(user.updatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {renderPagination(usersPage, totalUsersItems, setUsersPage)}
          </div>
        )}

        {/* TAB 2: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
                    <th className="px-4 py-3 rounded-l-lg text-center w-12">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-center">Attempts</th>
                    <th className="px-4 py-3 text-center">Completion Time</th>
                    <th className="px-4 py-3 rounded-r-lg">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No leaderboard entries found yet.</td>
                    </tr>
                  ) : (
                    paginatedLeaderboard.map((entry, index) => (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors">
                        <td className="px-4 py-3.5 text-center font-bold text-slate-800 dark:text-slate-100">
                          {(leaderboardPage - 1) * ITEMS_PER_PAGE + index + 1 === 1 ? '🥇' : (leaderboardPage - 1) * ITEMS_PER_PAGE + index + 1 === 2 ? '🥈' : (leaderboardPage - 1) * ITEMS_PER_PAGE + index + 1 === 3 ? '🥉' : (leaderboardPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="px-4 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                            {entry.user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{entry.user.name || "Anonymous"}</p>
                            <p className="text-xs text-slate-400">{entry.user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-indigo-600">
                          {entry.attempts}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-600 dark:text-slate-300">
                          {entry.durationSeconds}s
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(entry.startedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {renderPagination(leaderboardPage, totalLeaderboardItems, setLeaderboardPage)}
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboardClient;

