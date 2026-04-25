import GameBoard from "../components/GameBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-4 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col text-slate-800">
      <div className="max-w-7xl mx-auto w-full flex flex-col">
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
            Can you crack the code before the 🤖 AI does?
          </p>
        </header>

        {/* Mobile Header (Compact) */}
        <header className="sm:hidden text-center mb-4 shrink-0 flex items-center justify-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bulls and <span className="text-indigo-600">Cows</span>
          </h1>
        </header>

        {/* Game Area */}
        <section className="relative w-full">
          {/* Decorative elements */}
          <div className="hidden sm:block absolute top-0 left-1/4 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="hidden sm:block absolute bottom-0 right-1/4 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

          <GameBoard />
        </section>

        {/* Footer / Instructions */}
        <footer className="mt-12 sm:mt-20 pt-8 sm:pt-8 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-sm text-slate-500">
            <div>
              <h4 className="font-bold text-slate-700 uppercase mb-4 tracking-wider">How to Play</h4>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">1</span>
                  <span>Keep a secret 4-digit number in your mind. Digits should be unique (0-9).</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">2</span>
                  <span>Take turns with the system to guess each other's secret number.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">3</span>
                  <span>Get feedback: <strong>Matched Digits</strong> are digits that exist in the secret, and <strong>Matched Positions</strong> are those in the correct spot.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm self-start">
              <h4 className="font-bold text-slate-700 uppercase mb-4 tracking-wider">About the Game</h4>
              <p className="leading-relaxed">
                Bulls and Cows is an old code-breaking mind or paper and pencil game for two or more players, predating the commercially marketed board game Mastermind.
              </p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 text-sm text-slate-600 space-y-4 max-w-7xl">
            <p>
              Thank you for playing! I'm a Full Stack Developer passionate about crafting elegant web experiences. You can follow me on GitHub <a href="https://github.com/anishkonodi" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">@anishkonodi</a>.
            </p>
            <p>
              Do star the <a href="https://github.com/anishkonodi/bulls-and-cows" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Bulls-and-Cows GitHub Repository</a> and if you enjoy the game, make sure to challenge your friends to see who can crack the code faster.
            </p>
            <p>
              ~ Anish (<a href="#" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">https://anishbharadwaj.in</a>)
            </p>
          </div>

          <p className="text-center mt-12 text-slate-400 font-small">
            ©️ Anish Bharadwaj | Built with Next.js 14
          </p>
        </footer>
      </div>
    </main>
  );
}
