import React, { useEffect, useRef } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  breadcrumbs: Array<{ id: string; label: string; onClick: () => void }>;
  children: React.ReactNode;
}

export const ZoomableCard: React.FC<Props> = ({ isOpen, onClose, breadcrumbs, children }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      cardRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4"
      role="presentation"
      onClick={onClose}
      aria-label="Zoomed comment backdrop"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-4 top-4 flex gap-1">
          {breadcrumbs.map((crumb, idx) => (
            <button
              key={crumb.id}
              className="h-2 w-8 rounded-full border border-slate-200 bg-white/80 shadow-sm"
              aria-label={`Go to depth ${idx}`}
              onClick={(e) => {
                e.stopPropagation();
                crumb.onClick();
              }}
            />
          ))}
        </div>
      </div>
      <div
        ref={cardRef}
        className="relative z-50 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-card p-4 shadow-2xl outline-none transition-transform duration-300"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
