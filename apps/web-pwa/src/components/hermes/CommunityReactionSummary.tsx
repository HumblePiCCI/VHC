import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@vh/ui';
import { useAI } from '@vh/ai-engine';
import { useForumStore } from '../../store/hermesForum';
import { useIdentity } from '../../hooks/useIdentity';

type ActionType = 'send' | 'proposal' | 'project';

interface Props {
  threadId: string;
}

const DEBOUNCE_MS = 45_000;
const EMPTY_COMMENTS: readonly any[] = []; // Stable reference for empty state

export const CommunityReactionSummary: React.FC<Props> = ({ threadId }) => {
  const comments = useForumStore((s) => s.comments.get(threadId)) ?? EMPTY_COMMENTS;
  const { identity } = useIdentity();
  const { analyze } = useAI({ workerFactory: undefined });

  const participantCount = useMemo(() => new Set(comments.map((c) => c.author)).size, [comments]);
  const concurCount = useMemo(() => comments.filter((c) => c.stance === 'concur').length, [comments]);
  const counterCount = useMemo(() => comments.filter((c) => c.stance === 'counter').length, [comments]);

  const userComments = useMemo(
    () => comments.filter((c) => c.author === identity?.session?.nullifier),
    [comments, identity?.session?.nullifier]
  );
  const userStance = userComments[0]?.stance;

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState<ActionType | null>(null);
  const lastGeneratedRef = useRef<number>(0);
  const debounceTimer = useRef<number | null>(null);

  const buildPrompt = useCallback(() => {
    const concurText = comments
      .filter((c) => c.stance === 'concur')
      .map((c) => c.content)
      .join('\n');
    const counterText = comments
      .filter((c) => c.stance === 'counter')
      .map((c) => c.content)
      .join('\n');
    return `Summarize the following community discussion into two categories.

CONCUR ARGUMENTS (supporting the topic):
${concurText}

COUNTER ARGUMENTS (opposing the topic):
${counterText}

Provide:
1. A 1-2 sentence neutral summary of the overall debate
2. The main theme from CONCUR arguments (1 sentence)
3. The main theme from COUNTER arguments (1 sentence)

RULES:
- Be neutral and factual
- Do NOT include usernames or handles
- Do NOT include any personally identifiable information
- Focus on the substance of the arguments`;
  }, [comments]);

  const isGeneratingRef = useRef(false);
  
  const generateSummary = useCallback(async () => {
    // Use ref to check generating state to avoid callback instability
    if (isGeneratingRef.current || comments.length === 0) return;
    if (Date.now() - lastGeneratedRef.current < DEBOUNCE_MS) return;
    isGeneratingRef.current = true;
    setIsGenerating(true);
    try {
      const res = await analyze(buildPrompt());
      // @vh/ai-engine returns object with summary; fall back to string
      const summary = (res as any)?.summary ?? (typeof res === 'string' ? res : null);
      if (summary) {
        setAiSummary(summary);
        lastGeneratedRef.current = Date.now();
      }
    } catch (err) {
      console.warn('[vh:forum] AI summary failed', err);
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  }, [analyze, buildPrompt, comments.length]); // Removed isGenerating from deps

  // Store generateSummary in a ref to avoid effect dependency instability
  const generateSummaryRef = useRef(generateSummary);
  generateSummaryRef.current = generateSummary;

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (comments.length === 0) return;
    debounceTimer.current = window.setTimeout(() => {
      void generateSummaryRef.current();
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [comments.length]); // Only trigger on comment count change, not on every comments array reference change

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-card p-4 shadow-sm dark:border-slate-700" data-testid="community-summary">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Community Reaction Summary</p>
        <Button size="sm" variant="ghost" onClick={() => void generateSummary()} disabled={isGenerating} data-testid="refresh-summary">
          {isGenerating ? 'Generating…' : '🔄 Refresh Summary'}
        </Button>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-200">
        {participantCount} participants • {concurCount} Concur, {counterCount} Counter
      </p>
      {userComments.length > 0 && (
        <p className="text-sm text-emerald-700 dark:text-emerald-300" data-testid="user-participated">
          ✅ You participated{userStance ? ` (${userStance})` : ''}
        </p>
      )}
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300" data-testid="district-placeholder">
        <span>📊</span>
        <span className="flex items-center gap-1">
          <span role="img" aria-label="Locked">
            🔒
          </span>
          Requires verified constituency (Coming in Sprint 4)
        </span>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 bg-card-muted p-3 text-sm dark:border-slate-700">
        <p className="font-semibold text-slate-900 dark:text-slate-100">AI Summary</p>
        <p className="text-slate-700 dark:text-slate-200" data-testid="ai-summary">
          {aiSummary ?? 'Summary will appear here after generation.'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton action="send" label="Send to Rep" onOpen={setModalOpen} />
        <ActionButton action="proposal" label="Draft Proposal" onOpen={setModalOpen} />
        <ActionButton action="project" label="Start Project" onOpen={setModalOpen} />
      </div>
      {modalOpen && <ComingSoonModal action={modalOpen} onClose={() => setModalOpen(null)} />}
    </div>
  );
};

const ActionButton: React.FC<{ action: ActionType; label: string; onOpen: (action: ActionType) => void }> = ({
  action,
  label,
  onOpen
}) => (
  <Button variant="secondary" onClick={() => onOpen(action)} aria-describedby={`${action}-coming-soon`} data-testid={`action-${action}`}>
    {label}
  </Button>
);

const ComingSoonModal: React.FC<{ action: ActionType; onClose: () => void }> = ({ action, onClose }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>('button');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    modalRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const labels: Record<ActionType, { title: string; desc: string }> = {
    send: { title: 'Send to Representative', desc: 'Coming in Sprint 4 (Sovereign Legislative Bridge).' },
    proposal: { title: 'Draft Proposal', desc: 'Coming in Sprint 4 (Quadratic Funding).' },
    project: { title: 'Start Project', desc: 'Coming in Sprint 4 (Community Initiatives).' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
        aria-describedby="coming-soon-desc"
        tabIndex={-1}
        className="max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="coming-soon-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {labels[action].title}
        </h2>
        <p id="coming-soon-desc" className="mt-2 text-sm text-slate-700 dark:text-slate-200">
          {labels[action].desc}
        </p>
        <Button className="mt-4 w-full" onClick={onClose} data-testid="close-coming-soon">
          Close
        </Button>
      </div>
    </div>
  );
};
