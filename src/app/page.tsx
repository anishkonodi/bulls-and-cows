import GameBoard from "../components/GameBoard";
import { auth, signIn, signOut } from "../auth";
import Link from "next/link";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";
import ThemeToggle from "../components/ThemeToggle";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  const isAdmin = user?.email
    ? (env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .includes(user.email.toLowerCase())
    : false;

  let dbUser = null;
  if (user?.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        gamesPlayed: true,
        gamesWon: true,
        bestAttempts: true,
      },
    });
  }

  const emailMailto = "https://mail.google.com/mail/?view=cm&fs=1&to=anishkonodi@gmail.com";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#0b0f19] dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8 font-sans flex flex-col relative overflow-x-clip selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic background glow elements (Only in dark mode for performance & aesthetic) */}
      <div className="absolute top-[-10%] left-[10%] w-[35rem] h-[35rem] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[35rem] h-[35rem] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[15s]"></div>

      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 relative z-10 space-y-4 sm:space-y-6">
        
        {/* Navigation & Header Header */}
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-sm dark:shadow-2xl gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black text-xl text-white tracking-wider shrink-0 animate-bounce-slow">
                B
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Bulls and <span className="text-indigo-600 dark:text-indigo-400">Cows</span>
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium sm:block hidden">Challenge the system in this ultimate numbers duel.</p>
              </div>
            </div>
            
            {/* Theme Toggle next to logo/title on mobile */}
            <div className="sm:hidden shrink-0">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 sm:gap-4 w-full sm:w-auto shrink-0">
            {/* Theme Toggle on desktop */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {user ? (
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 shadow-sm uppercase shrink-0">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col items-start text-left sm:hidden">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-indigo-400/80 uppercase tracking-widest leading-none">Logged In As</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">{user.name || user.email}</span>
                  </div>
                  <div className="hidden md:flex flex-col items-end text-right">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-indigo-400/80 uppercase tracking-widest">Logged In As</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name || user.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-xs font-bold text-indigo-600 dark:text-purple-300 hover:text-indigo-800 dark:hover:text-white transition-all bg-indigo-50 dark:bg-purple-500/10 hover:bg-indigo-100 dark:hover:bg-purple-500/20 border border-indigo-200 dark:border-purple-500/30 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-md cursor-pointer shrink-0"
                    >
                      🛠️ Admin
                    </Link>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                    className="shrink-0"
                  >
                    <button
                      type="submit"
                      className="text-xs font-bold text-slate-500 hover:text-red-650 dark:text-slate-400 dark:hover:text-rose-400 transition-all bg-slate-100 hover:bg-red-50 dark:bg-slate-800/40 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700/60 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
                className="w-full sm:w-auto"
              >
                <button
                  type="submit"
                  className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 sm:py-2.5 rounded-xl border border-indigo-500 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.85-6.277-6.36s2.81-6.36 6.277-6.36c1.497 0 2.87.525 3.96 1.4l3.125-3.125C18.99 2.057 15.82 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.89 0 10.985-4.148 10.985-11.24 0-.585-.053-1.16-.16-1.725l-10.825-.03Z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>
            )}
          </div>
        </header>

        {/* Dashboard Grid / Welcome Header */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 shrink-0">
          
          {/* Welcome / Intro Panel */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-black tracking-wider uppercase border border-indigo-100 dark:border-indigo-500/20 mb-3">
                Strategy Game
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                Crack the <span className="text-indigo-600 dark:text-indigo-400">Secret Code</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed font-medium">
                Challenge the system in this ultimate numbers duel. Can you crack the code before the 🤖 System does?
              </p>
            </div>
            {!user && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-4 bg-slate-100 dark:bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/40 flex items-start gap-1.5">
                <span className="shrink-0">⚡</span>
                <span>Guest Mode active. Login at the top right to enable global stats tracking and leaderboard ranking!</span>
              </p>
            )}
          </div>

          {/* Stats Summary Panel */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl flex flex-col justify-between">
            {user && dbUser ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 dark:text-indigo-400/80 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Your Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Games Played</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">{dbUser.gamesPlayed}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Win Rate</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {dbUser.gamesPlayed > 0 ? `${Math.round((dbUser.gamesWon / dbUser.gamesPlayed) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Won / Lost</span>
                    <span className="text-xs font-bold mt-1 block">
                      <span className="text-emerald-600 dark:text-emerald-400">{dbUser.gamesWon}</span>
                      <span className="text-slate-400 dark:text-slate-600"> / </span>
                      <span className="text-rose-600 dark:text-rose-500">{dbUser.gamesPlayed - dbUser.gamesWon}</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Best Record</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                      {dbUser.bestAttempts ? `${dbUser.bestAttempts} Guess` : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-2 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-xl">
                  🚀
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Local Gameplay Active</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Log in to unlock custom stats, leaderboard submission, and play records!
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Game Arena Section */}
        <section className="flex-1 min-h-0 bg-white dark:bg-slate-900 p-3 sm:p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl relative">
          <GameBoard isLoggedIn={!!user} />
        </section>

        {/* Instructions Footer */}
        <footer className="bg-white dark:bg-slate-900/30 p-4 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 sm:space-y-6">
          <div className="max-w-4xl mx-auto">
            <h4 className="font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider text-center text-sm mb-6">How to Play</h4>
            <div className="space-y-4 text-slate-600 dark:text-slate-400">
              <p className="leading-relaxed text-slate-500 dark:text-slate-400 text-center text-sm">
                Bulls and Cows is a classic turn-based code-breaking game. You compete against the System to crack each other&apos;s secret 4-digit number first.
              </p>
              
              <ul className="space-y-4 mt-6">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">1</span>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-200 block text-sm">Choose a Secret Number</strong>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Pick any 4-digit number (repeating digits are allowed, e.g., <code>0156</code> or <code>1219</code>). Keep this secret!</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">2</span>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-200 block text-sm">Take Turns Guessing</strong>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">You guess the System&apos;s secret number, and the System guesses yours. For every guess, clues are returned.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">3</span>
                  <div>
                    <strong className="text-slate-700 dark:text-slate-200 block text-sm">Read the Clues</strong>
                    <div className="text-slate-500 dark:text-slate-400 space-y-1.5 mt-1 text-xs">
                      <p>&bull; <strong className="text-slate-600 dark:text-slate-300 font-semibold">Matched Positions (P):</strong> Digits that are correct and in the <strong>exact right position</strong>.</p>
                      <p>&bull; <strong className="text-slate-600 dark:text-slate-300 font-semibold">Matched Digits (D):</strong> Total count of digits in your guess that <strong>exist in the secret number</strong> (regardless of position).</p>
                    </div>
                  </div>
                </li>
              </ul>

              <div className="mt-6 p-3 sm:p-4 bg-slate-100 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-900 max-w-xl mx-auto">
                <p className="font-bold text-slate-700 dark:text-slate-400 text-[10px] uppercase tracking-wider text-center">Example Scenario</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-2 text-center">
                  Suppose the secret number is <span className="font-mono bg-slate-200 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-800 dark:text-indigo-300 font-bold border border-slate-300 dark:border-slate-800">4271</span>:
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex gap-2 justify-center">
                    <span className="font-semibold text-slate-500">Your Guess:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-350 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">1234</span>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <span className="font-semibold text-slate-500">Clue Result:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/25">1 Matched Position (P), 3 Matched Digits (D)</span>
                  </div>
                  <div className="pl-4 py-1 border-l-2 border-indigo-100 dark:border-indigo-900 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 max-w-md mx-auto">
                    <p>&bull; <span className="font-mono text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-500/20 font-semibold">2</span> is in the 2nd position in both &rarr; <span className="text-emerald-700 dark:text-emerald-400 font-semibold">1 Matched Position (P)</span></p>
                    <p>&bull; <span className="font-mono text-indigo-800 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-100 dark:border-indigo-500/20 font-semibold">1</span>, <span className="font-mono text-indigo-800 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-100 dark:border-indigo-500/20 font-semibold">2</span>, and <span className="font-mono text-indigo-800 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-100 dark:border-indigo-500/20 font-semibold">4</span> all exist in the secret number &rarr; <span className="text-indigo-700 dark:text-indigo-400 font-semibold">3 Matched Digits (D)</span></p>
                    <p>&bull; <span className="font-mono text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-800">3</span> does not exist in the secret number.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-col items-center justify-center space-y-4">
            <h4 className="font-bold text-slate-700 dark:text-slate-400 uppercase text-xs tracking-wider text-center">Contact</h4>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/anishkonodi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-550/30 dark:hover:border-indigo-500/30 transition-all hover:scale-105"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/anish-bharadwaj-k-g-6ba447213"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all hover:scale-105"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/anish_bharadwaj_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-550/30 dark:hover:border-indigo-550/30 transition-all hover:scale-105"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href={emailMailto}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Send Email"
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
            <p className="text-center text-slate-500 dark:text-slate-500 text-[11px] font-semibold">
              © Bulls and Cows | Built with Next.js 14
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
