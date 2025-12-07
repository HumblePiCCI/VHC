import React, { useMemo, useState } from 'react';
import { Button } from '@vh/ui';
import QRCode from 'react-qr-code';
import { useIdentity } from '../../hooks/useIdentity';
import { getHandleError } from '../../utils/handle';

export const IDChip: React.FC = () => {
  const { identity } = useIdentity();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const payload = useMemo(() => {
    if (!identity?.session?.nullifier || !identity?.devicePair?.epub) return null;
    const handleError = identity.handle ? getHandleError(identity.handle) : null;
    const safeHandle = handleError ? undefined : identity.handle;
    return {
      nullifier: identity.session.nullifier,
      epub: identity.devicePair.epub,
      handle: safeHandle
    };
  }, [identity]);

  const encoded = payload ? JSON.stringify(payload) : 'no-identity';
  const displayLabel =
    payload && payload.nullifier
      ? `@${payload.handle ?? 'anonymous'} • ${payload.nullifier.slice(0, 10)}…`
      : 'no-identity';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(encoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="sticky top-0 z-10 rounded-xl border border-slate-200 bg-card p-3 shadow-sm dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Your ID</p>
          <p className="text-xs text-slate-600 dark:text-slate-300" data-testid="idchip-label">
            {displayLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowQR((prev) => !prev)} aria-expanded={showQR}>
            Show QR
          </Button>
          <Button size="sm" onClick={() => void handleCopy()} aria-live="polite">
            {copied ? 'Copied!' : 'Copy ID'}
          </Button>
        </div>
      </div>
      {showQR && (
        <div className="mt-3 flex items-center gap-3">
          <div
            className="h-36 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700"
            data-testid="idchip-qr"
          >
            <QRCode value={encoded} size={128} />
          </div>
          <p className="text-[11px] text-slate-600 break-all" data-testid="idchip-data">
            {encoded}
          </p>
        </div>
      )}
    </div>
  );
};

// Temporary backwards-compatible export until callers are updated.
export const ContactQR = IDChip;
