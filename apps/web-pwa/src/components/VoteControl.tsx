import React, { useEffect, useMemo, useState } from 'react';

interface VoteControlProps {
  onSubmit: (amount: number, direction: 'for' | 'against') => Promise<'recorded' | 'updated' | 'switched' | void> | void;
  disabled?: boolean;
  votedDirection?: 'for' | 'against';
}

export const VoteControl: React.FC<VoteControlProps> = ({ onSubmit, disabled, votedDirection }) => {
  const [amount, setAmount] = useState(1);
  const [direction, setDirection] = useState<'for' | 'against'>('for');
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'recorded' | 'updated' | 'switched' | null>(null);
  const [lastDirection, setLastDirection] = useState<'for' | 'against' | null>(null);
  const [lastResult, setLastResult] = useState<'recorded' | 'updated' | 'switched' | null>(null);

  useEffect(() => {
    if (amount < 1) setAmount(1);
  }, [amount]);

  const voiceCredits = useMemo(() => amount * amount, [amount]);

  const handleSubmit = async () => {
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than 0');
      setAmount(1);
      return;
    }
    setError(null);
    try {
      const result = await onSubmit(amount, direction);
      setFlash(true);
      setTimeout(() => setFlash(false), 900);
      setLastDirection(direction);
      setSuccess(true);
      if (result === 'switched' || result === 'updated' || result === 'recorded') {
        setSuccessType(result);
        setLastResult(result);
      } else {
        setSuccessType(null);
        setLastResult(null);
      }
      setTimeout(() => setSuccess(false), 1500);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-700">Vote Amount (RVU)</label>
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => {
            const val = Number(e.target.value);
            setAmount(Number.isNaN(val) || val <= 0 ? 1 : val);
          }}
          className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
          data-testid="vote-amount"
          disabled={disabled}
        />
        <input
          type="range"
          min={1}
          max={100}
          value={amount}
          onChange={(e) => {
            const val = Number(e.target.value);
            setAmount(Number.isNaN(val) || val <= 0 ? 1 : val);
          }}
          className="flex-1"
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-700 relative pb-10">
        <button
          type="button"
          className={`rounded px-3 py-1 ${direction === 'for' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'}`}
          onClick={() => setDirection('for')}
          data-testid="vote-for"
          disabled={disabled}
        >
          For
        </button>
        {votedDirection === 'for' && (
          <span className="absolute left-0 top-10 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
            You voted for
          </span>
        )}
        <button
          type="button"
          className={`rounded px-3 py-1 ${direction === 'against' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-800'}`}
          onClick={() => setDirection('against')}
          data-testid="vote-against"
          disabled={disabled}
        >
          Against
        </button>
        <span className="ml-auto text-xs text-slate-500" data-testid="voice-credits">
          Voice Credits: {voiceCredits}
        </span>
        {(success || votedDirection || lastDirection) && (
          <span
            className={`absolute left-${lastDirection === 'against' || votedDirection === 'against' ? '[6rem]' : '0'} top-10 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              (lastDirection ?? votedDirection) === 'against'
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {successType === 'switched'
              ? 'Vote switched'
              : successType === 'updated'
              ? 'Vote updated'
              : `You voted ${(lastDirection ?? votedDirection) ?? direction}`}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end items-center">
        <button
          type="button"
          className={`rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition transform ${
            lastResult === 'updated' && votedDirection === direction
              ? 'bg-amber-500'
              : 'bg-indigo-600'
          }`}
          style={
            flash
              ? {
                  boxShadow: '0 0 0 6px rgba(79, 70, 229, 0.25)',
                  transform: 'scale(1.03)'
                }
              : undefined
          }
          onClick={handleSubmit}
          disabled={disabled}
          data-testid="submit-vote"
        >
          {lastResult === 'updated' && votedDirection === direction ? 'Already voted' : 'Submit Vote'}
        </button>
      </div>
    </div>
  );
};

export default VoteControl;
