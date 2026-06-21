import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import AdminDashboardClient from '../../components/AdminDashboardClient';
import Link from 'next/link';
import { env } from '../../lib/env';

export default async function AdminDashboardPage() {
  const session = await auth();

  // 1. Secure Check: Redirect if not logged in
  if (!session || !session.user || !session.user.email) {
    redirect('/');
  }

  const adminEmails = (env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase());

  // 2. Secure Check: Verify user is in ADMIN_EMAILS env variable
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
            🚫
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            You do not have permission to view the Admin Dashboard. If you think this is a mistake, please verify your email in the system settings.
          </p>
          <Link
            href="/"
            className="inline-block bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md text-sm"
          >
            Back to Game
          </Link>
        </div>
      </main>
    );
  }

  // 3. Parallel Server-side DB Queries
  const [totalUsers, totalGames, totalWins, attemptsAgg, durationAgg, dailyActiveUsers, users, leaderboard, auditLogs] = await Promise.all([
    // Total Users
    prisma.user.count(),
    
    // Total Games
    prisma.gameSession.count({ where: { isCompleted: true } }),
    
    // Total Wins
    prisma.gameSession.count({ where: { isCompleted: true, isWinner: true } }),
    
    // Avg Attempts
    prisma.gameSession.aggregate({
      _avg: { attempts: true },
      where: { isCompleted: true },
    }),
    
    // Avg Duration
    prisma.gameSession.aggregate({
      _avg: { durationSeconds: true },
      where: { isCompleted: true, durationSeconds: { not: null } },
    }),
    
    // Daily Active Users
    prisma.user.count({
      where: {
        lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    
    // All Users Directory
    prisma.user.findMany({
      orderBy: { lastLoginAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        browser: true,
        operatingSystem: true,
        deviceType: true,
        country: true,
        gamesPlayed: true,
        gamesWon: true,
        totalAttempts: true,
        bestAttempts: true,
        lastLoginAt: true,
      },
    }),
    
    // Leaderboard sessions
    prisma.gameSession.findMany({
      where: {
        isWinner: true,
        isCompleted: true,
        durationSeconds: { not: null },
      },
      orderBy: [
        { attempts: 'asc' },
        { durationSeconds: 'asc' },
      ],
      take: 50,
      select: {
        id: true,
        attempts: true,
        durationSeconds: true,
        startedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    }),
    
    // Recent logs
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        metadata: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const metrics = {
    totalUsers,
    totalGames,
    totalWins,
    averageAttempts: attemptsAgg._avg.attempts || 0,
    averageGameDuration: durationAgg._avg.durationSeconds || 0,
    dailyActiveUsers,
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage users, audit system logs, and analyze game metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm"
            >
              🎮 Play Game
            </Link>
          </div>
        </div>

        {/* Dashboard Client Component */}
        <AdminDashboardClient
          metrics={metrics}
          users={users}
          leaderboard={leaderboard}
          auditLogs={auditLogs}
        />

      </div>
    </main>
  );
}
