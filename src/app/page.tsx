import GameBoard from "../components/GameBoard";
import { auth, signIn, signOut } from "../auth";
import Link from "next/link";
import { prisma } from "../lib/prisma";

import { env } from "../lib/env";

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

  // const emailMailto = "https://mail.google.com/mail/u/0/?tab=rm#inbox?compose=anishkonodi@gmail.com";
  const emailMailto = "https://mail.google.com/mail/?view=cm&fs=1&to=anishkonodi@gmail.com";

  return (
    <main className="min-h-screen bg-slate-50 py-4 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col text-slate-800">
      <div className="max-w-7xl mx-auto w-full flex flex-col">

        {/* User Header Section (Displays Profile & Sign Out if Logged In) */}
        {user && (
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm mb-6 shrink-0">
            <div className="flex items-center gap-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User profile"}
                  className="w-10 h-10 rounded-full border border-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged In As</p>
                <p className="text-sm font-bold text-slate-800">{user.name || user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-4 py-2 rounded-xl shadow-sm"
                >
                  🛠️ Admin Dashboard
                </Link>
              )}

              <form
                action={async () => {
                  "use server";
                  // NextAuth sign out log action is automatically generated on callback
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-100 px-4 py-2 rounded-xl shadow-sm"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Personal Game Dashboard */}
        {user && dbUser && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm mb-6 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center sm:text-left border-r border-slate-100 last:border-r-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Games Played</span>
              <span className="text-2xl font-black text-slate-800">{dbUser.gamesPlayed}</span>
            </div>
            <div className="text-center sm:text-left border-r border-slate-100 last:border-r-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Won / Lost</span>
              <span className="text-2xl font-black text-slate-800">
                <span className="text-emerald-600">{dbUser.gamesWon}</span>
                <span className="text-slate-300"> / </span>
                <span className="text-rose-600">{dbUser.gamesPlayed - dbUser.gamesWon}</span>
              </span>
            </div>
            <div className="text-center sm:text-left border-r border-slate-100 last:border-r-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Win Rate</span>
              <span className="text-2xl font-black text-indigo-600">
                {dbUser.gamesPlayed > 0
                  ? `${Math.round((dbUser.gamesWon / dbUser.gamesPlayed) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Best Record</span>
              <span className="text-2xl font-black text-slate-800">
                {dbUser.bestAttempts ? `${dbUser.bestAttempts} Guess` : 'None'}
              </span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <header className="text-center mb-6 sm:mb-12 space-y-2 sm:space-y-4 shrink-0 hidden sm:block">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold tracking-wide uppercase shadow-sm border border-indigo-100">
            Strategy Game
          </div>
          <h1 className="text-3xl sm:text-6xl font-black text-slate-900 tracking-tight">
            Bulls and <span className="text-indigo-600">Cows</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-lg max-w-xl mx-auto font-medium">
            Challenge the system in this ultimate numbers duel.
            Can you crack the code before the 🤖 System does?
          </p>
        </header>

        {/* Mobile Header (Compact) */}
        <header className="sm:hidden text-center mb-4 shrink-0 flex items-center justify-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bulls and <span className="text-indigo-600">Cows</span>
          </h1>
        </header>

        {/* Game Area / Auth Redirect Area */}
        <section className="relative w-full">
          {/* Decorative elements */}
          <div className="hidden sm:block absolute top-0 left-1/4 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="hidden sm:block absolute bottom-0 right-1/4 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

          {user ? (
            <GameBoard />
          ) : (
            <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                🔐
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Authentication Required</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                To start playing Bulls and Cows, tracking your scores, and challenging the System, please authenticate using your Google account.
              </p>

              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button
                  type="submit"
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.85-6.277-6.36s2.81-6.36 6.277-6.36c1.497 0 2.87.525 3.96 1.4l3.125-3.125C18.99 2.057 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.89 0 10.985-4.148 10.985-11.24 0-.585-.053-1.16-.16-1.725l-10.825-.03Z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </form>
            </div>
          )}
        </section>

        {/* Footer / Instructions */}
        <footer className="mt-12 sm:mt-20 pt-8 sm:pt-8 border-t border-slate-200">
          <div className="max-w-3xl mx-auto text-sm text-slate-500">
            <div>
              <h4 className="font-bold text-slate-700 uppercase mb-4 tracking-wider text-center">How to Play</h4>
              <div className="space-y-4 text-slate-600">
                <p className="leading-relaxed text-slate-500 text-center">
                  Bulls and Cows is a classic turn-based code-breaking game. You compete against the System to crack each other's secret 4-digit number first.
                </p>
                
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">1</span>
                    <div>
                      <strong className="text-slate-700 block">Choose a Secret Number</strong>
                      <span className="text-slate-500">Pick any 4-digit number (repeating digits are allowed, e.g., <code>0156</code> or <code>1219</code>). Keep this secret!</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">2</span>
                    <div>
                      <strong className="text-slate-700 block">Take Turns Guessing</strong>
                      <span className="text-slate-500">You guess the System's secret number, and the System guesses yours. For every guess, clues are returned.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">3</span>
                    <div>
                      <strong className="text-slate-700 block">Read the Clues</strong>
                      <div className="text-slate-500 space-y-1.5 mt-1">
                        <p>&bull; <strong className="text-slate-600 font-semibold">Matched Positions (P):</strong> Digits that are correct and in the <strong>exact right position</strong>.</p>
                        <p>&bull; <strong className="text-slate-600 font-semibold">Matched Digits (D):</strong> Total count of digits in your guess that <strong>exist in the secret number</strong> (regardless of position).</p>
                      </div>
                    </div>
                  </li>
                </ul>

                <div className="mt-4 p-4 bg-slate-100 rounded-2xl border border-slate-200 max-w-xl mx-auto">
                  <p className="font-bold text-slate-700 text-[10px] uppercase mb-2 tracking-wider text-center">Example Scenario</p>
                  <p className="text-xs text-slate-500 mb-2 text-center">
                    Suppose the secret number is <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-bold">4271</span>:
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="flex gap-2 justify-center">
                      <span className="font-semibold text-slate-500">Your Guess:</span>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">1234</span>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <span className="font-semibold text-slate-500">Clue Result:</span>
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">1 Matched Position (P), 3 Matched Digits (D)</span>
                    </div>
                    <div className="pl-4 py-1 border-l-2 border-indigo-100 text-[11px] text-slate-500 space-y-1.5 max-w-md mx-auto">
                      <p>&bull; <span className="font-mono text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100 font-semibold">2</span> is in the 2nd position in both &rarr; <span className="text-emerald-700 font-semibold">1 Matched Position (P)</span></p>
                      <p>&bull; <span className="font-mono text-indigo-800 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100 font-semibold">1</span>, <span className="font-mono text-indigo-800 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100 font-semibold">2</span>, and <span className="font-mono text-indigo-800 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100 font-semibold">4</span> all exist in the secret number &rarr; <span className="text-indigo-700 font-semibold">3 Matched Digits (D)</span></p>
                      <p>&bull; <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">3</span> does not exist in the secret number.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col items-center justify-center space-y-4">
            <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider text-center">Contact</h4>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/anishkonodi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/anish-bharadwaj-k-g-6ba447213"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/anish_bharadwaj_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href={emailMailto}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Send Email"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          <p className="text-center mt-12 text-slate-400 font-small">
            © Bulls and Cows | Built with Next.js 14
          </p>
        </footer>
      </div>
    </main>
  );
}
