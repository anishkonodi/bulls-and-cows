'use client';

import React, { useState, useRef, useEffect } from 'react';
import UserGuessPanel from './UserGuessPanel';
import SystemGuessPanel from './SystemGuessPanel';
import GuessHistory, { GuessRecord } from './GuessHistory';
import { generateSecretNumber } from '@/src/lib/numberUtils';
import { calculateBullsAndCows } from '@/src/lib/gameLogic';
import { SystemPlayer } from '@/src/lib/systemPlayer';

type GameStage = 'SETUP' | 'PLAYING' | 'FINISHED';
type Turn = 'USER' | 'SYSTEM';

interface GameBoardProps {
  isLoggedIn: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ isLoggedIn }) => {
  const [stage, setStage] = useState<GameStage>('SETUP');
  const [turn, setTurn] = useState<Turn>('USER');
  const [systemSecret, setSystemSecret] = useState('');
  const [userHistory, setUserHistory] = useState<GuessRecord[]>([]);
  const [systemHistory, setSystemHistory] = useState<GuessRecord[]>([]);
  const [winner, setWinner] = useState<'USER' | 'SYSTEM' | null>(null);
  const [currentSystemGuess, setCurrentSystemGuess] = useState<string | null>(null);
  const [setupError, setSetupError] = useState('');

  const systemAI = useRef<SystemPlayer | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Prevent background body scroll when game overlay is active on mobile
  useEffect(() => {
    if (stage !== 'SETUP') {
      document.documentElement.classList.add('overflow-hidden');
    } else {
      document.documentElement.classList.remove('overflow-hidden');
    }
    return () => {
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [stage]);

  // Initialize game
  const startGame = () => {
    const sysSecret = generateSecretNumber();
    setSystemSecret(sysSecret);
    systemAI.current = new SystemPlayer();
    setStage('PLAYING');
    setTurn('USER');
    setSetupError('');
    startTimeRef.current = Date.now();
  };

  const handleUserGuess = async (guess: string) => {
    const result = calculateBullsAndCows(systemSecret, guess);
    const newRecord: GuessRecord = { guess, ...result };
    const updatedUserHistory = [...userHistory, newRecord];
    setUserHistory(updatedUserHistory);

    if (result.positions === 4) {
      setWinner('USER');
      setStage('FINISHED');

      // Complete game session in DB only if logged in
      if (isLoggedIn && startTimeRef.current) {
        const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        fetch('/api/game/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isWinner: true,
            durationSeconds,
            guesses: updatedUserHistory.map(h => ({
              guess: h.guess,
              bulls: h.positions,
              cows: h.digits,
            })),
          }),
        }).catch((err) => console.error('Failed to complete game session in database:', err));
      }
    } else {
      setTurn('SYSTEM');
    }
  };

  // When it's system turn, generate a guess
  useEffect(() => {
    if (stage === 'PLAYING' && turn === 'SYSTEM' && !currentSystemGuess) {
      if (systemAI.current) {
        if (systemAI.current.getPossibleCount() > 0) {
          const guess = systemAI.current.getNextGuess();
          setCurrentSystemGuess(guess);
        }
      }
    }
  }, [stage, turn, currentSystemGuess]);

  const handleSystemFeedback = async (positions: number, digits: number) => {
    if (!currentSystemGuess) return;

    if (systemAI.current) {
      const isInconsistent = systemAI.current.isFeedbackInconsistent(currentSystemGuess, positions, digits);

      if (isInconsistent) {
        setSetupError('Wait! Based on your feedback, there are no possible numbers left. Please check your Matched Digits/Positions and try again.');
        return; // Stay on the current turn, don't update history
      }

      // If consistent, clear error and continue
      setSetupError('');
      systemAI.current.update(currentSystemGuess, positions, digits);
    }

    // Record history only if consistent
    const newRecord: GuessRecord = { guess: currentSystemGuess, positions, digits };
    setSystemHistory([...systemHistory, newRecord]);

    if (positions === 4) {
      setWinner('SYSTEM');
      setStage('FINISHED');

      // Complete game session in DB (User lost to System) only if logged in
      if (isLoggedIn && startTimeRef.current) {
        const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        fetch('/api/game/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isWinner: false,
            durationSeconds,
            guesses: userHistory.map(h => ({
              guess: h.guess,
              bulls: h.positions,
              cows: h.digits,
            })),
          }),
        }).catch((err) => console.error('Failed to complete game session in database:', err));
      }
    } else {
      setCurrentSystemGuess(null);
      setTurn('USER');
    }
  };

  const restartGame = () => {
    setStage('SETUP');
    setSystemSecret('');
    setUserHistory([]);
    setSystemHistory([]);
    setWinner(null);
    setCurrentSystemGuess(null);
    systemAI.current = null;
    startTimeRef.current = null;
  };

  if (stage === 'SETUP') {
    return (
      <div className="w-full max-w-md mx-auto py-8 px-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm dark:shadow-lg">
          <span className="text-4xl">🧠</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-3">Ready to Play?</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed">
          Think of a <span className="font-bold text-slate-700 dark:text-slate-200">4-digit secret number</span> (repeating digits are allowed, e.g., 2204 or 4038). Keep it in your mind or write it down.
        </p>
        <div className="space-y-4">
          <button
            onClick={startGame}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] uppercase tracking-wide text-xs sm:text-sm cursor-pointer"
          >
            I&apos;ve Selected My Number!
          </button>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">
            System will also generate its secret number
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#0b0f19] p-4 sm:p-0 pt-6 sm:pt-0 sm:static sm:z-auto sm:bg-transparent flex flex-col h-[100dvh] sm:h-auto lg:h-auto overflow-y-auto sm:overflow-y-visible animate-in fade-in duration-500 gap-4 sm:gap-6">
      {/* Game controls header */}
      <div className="flex items-center justify-between shrink-0">
        <button onClick={restartGame} className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-red-650 dark:hover:text-rose-455 transition-all flex items-center gap-1.5 bg-white dark:bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          {stage === 'FINISHED' ? 'Reset Game' : 'Quit Game'}
        </button>
        {stage === 'PLAYING' && (
          <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 bg-slate-100 dark:bg-slate-950/40 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400">
            <span className={`w-2 h-2 rounded-full ${turn === 'USER' ? 'bg-indigo-500 animate-ping' : 'bg-orange-500 animate-ping'}`}></span>
            Active Turn: <span className={turn === 'USER' ? 'text-indigo-650 dark:text-indigo-400' : 'text-orange-650 dark:text-orange-400'}>{turn}</span>
          </div>
        )}
      </div>

      {stage === 'FINISHED' && (
        <div className={`p-4 sm:p-8 rounded-2xl text-center shadow-sm dark:shadow-2xl border shrink-0 ${winner === 'USER' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-250 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-250 dark:border-rose-500/20'}`}>
          <h2 className="text-2xl sm:text-3xl font-black mb-1.5 flex items-center justify-center gap-3">
            {winner === 'USER' ? (
              <>
                <span className="text-3xl">🎉</span>
                <span className="text-emerald-800 dark:text-emerald-400">User Wins!</span>
              </>
            ) : (
              <>
                <span className="text-3xl">🤖</span>
                <span className="text-rose-800 dark:text-rose-450">System Wins!</span>
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5">
            {winner === 'USER' ? 'Congratulations! You guessed it first.' : 'The system was faster this time. Better luck next time!'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-850">
              System&apos;s Secret Number was: <span className="font-mono text-indigo-755 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded font-bold border border-indigo-100 dark:border-indigo-500/20 ml-1.5">{systemSecret}</span>
            </div>
            <button
              onClick={restartGame}
              className="bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-sm text-xs sm:text-sm uppercase tracking-wide cursor-pointer"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}

      {setupError && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-sm">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-bold text-rose-800 dark:text-rose-400 text-sm">Inconsistent Feedback!</h4>
            <p className="text-rose-600 dark:text-slate-400 text-xs mt-0.5">{setupError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start md:flex-1 md:min-h-0">
        {/* User Panel */}
        <div className="flex flex-col gap-3 md:h-full md:min-h-0">
          <div className="shrink-0">
            <UserGuessPanel
              onGuess={handleUserGuess}
              disabled={stage !== 'PLAYING' || turn !== 'USER'}
              lastResult={userHistory.length > 0 ? userHistory[userHistory.length - 1] : undefined}
            />
          </div>
          <div className="flex-1 min-h-0">
            <GuessHistory history={userHistory} title="Your" />
          </div>
        </div>

        {/* System Panel */}
        <div className="flex flex-col gap-3 md:h-full md:min-h-0">
          <div className="shrink-0">
            <SystemGuessPanel
              key={currentSystemGuess || 'none'}
              systemGuess={currentSystemGuess}
              onFeedback={handleSystemFeedback}
              disabled={stage !== 'PLAYING' || turn !== 'SYSTEM'}
              error={setupError}
            />
          </div>
          <div className="flex-1 min-h-0">
            <GuessHistory history={systemHistory} title="System" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
