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

const GameBoard: React.FC = () => {
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

      // Complete game session in DB
      if (startTimeRef.current) {
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
        setSetupError('Wait! Based on your feedback, there are no possible numbers left. Please check your Matched Digits/Positions and try again for this guess.');
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

      // Complete game session in DB (User lost to System)
      if (startTimeRef.current) {
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
      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-slate-100 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🧠</span>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">Ready to Play?</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Think of a <span className="font-bold text-slate-700">4-digit secret number</span> (repeating digits are allowed, e.g., 2204 or 4038).
          Keep it in your mind or write it down.
        </p>
        <div className="space-y-4">
          <button
            onClick={startGame}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98]"
          >
            I&apos;ve Selected My Number!
          </button>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            System will also generate its secret number
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 p-2 sm:p-0 pt-6 sm:pt-0 sm:static sm:z-auto sm:bg-transparent flex flex-col h-[100dvh] sm:h-auto lg:h-auto animate-in fade-in duration-500 gap-2 sm:gap-8">
      {/* Game controls header */}
      <div className="flex items-center shrink-0">
        <button onClick={restartGame} className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          {stage === 'FINISHED' ? 'Reset Game' : 'Quit Game'}
        </button>
      </div>

      {stage === 'FINISHED' && (
        <div className={`p-4 sm:p-8 rounded-2xl text-center shadow-2xl border-4 shrink-0 ${winner === 'USER' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h2 className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 flex items-center justify-center gap-2 sm:gap-3">
            {winner === 'USER' ? (
              <>
                <span className="text-3xl sm:text-5xl">🎉</span>
                <span className="text-green-800">User Wins!</span>
              </>
            ) : (
              <>
                <span className="text-3xl sm:text-5xl">🤖</span>
                <span className="text-red-800">System Wins!</span>
              </>
            )}
          </h2>
          <p className="text-xs sm:text-base text-slate-600 mb-4 sm:mb-6">
            {winner === 'USER' ? 'Congratulations! You guessed it first.' : 'The system was faster this time. Better luck next time!'}
          </p>
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <div className="text-xs sm:text-sm font-medium text-slate-500">
              System&apos;s Secret Number was: <span className="font-mono text-slate-800 bg-slate-200 px-2 py-1 rounded">{systemSecret}</span>
            </div>
            <button
              onClick={restartGame}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md text-sm sm:text-base"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}

      {setupError && (
        <div className="bg-red-50 border-2 border-red-200 p-2 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-4 shrink-0">
          <span className="text-xl sm:text-2xl">⚠️</span>
          <div>
            <h4 className="font-bold text-red-800 text-sm sm:text-base">Inconsistent Feedback!</h4>
            <p className="text-red-600 text-xs sm:text-sm">{setupError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:gap-8 items-start flex-1 min-h-0">
        {/* User Panel */}
        <div className="flex flex-col gap-2 sm:space-y-6 h-full min-h-0">
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
        <div className="flex flex-col gap-2 sm:space-y-6 h-full min-h-0">
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
