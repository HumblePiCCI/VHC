import React, { useEffect, useMemo, useState } from 'react';
import type { HermesComment } from '@vh/types';
import { useForumStore } from '../../store/hermesForum';
import { renderMarkdown } from '../../utils/markdown';
import { TrustGate } from './forum/TrustGate';
import { CommentComposer } from './forum/CommentComposer';

interface Props {
  threadId: string;
  comments: HermesComment[];
  parentId?: string | null;
  depth?: number;
}

type Stance = HermesComment['stance'];

// Tree line constants
const LINE_COLOR = 'var(--stream-thread-line)';
const LINE_WIDTH = 1.5;
const INDENT_PX = 28;
const BRANCH_HEIGHT = 20;
const TRUNK_PADDING_PX = INDENT_PX - LINE_WIDTH;

// Layout helpers
function cardMaxWidth(depth: number): string {
  if (depth === 0) return '92%';
  if (depth === 1) return '90%';
  if (depth === 2) return '88%';
  return '85%';
}

function getTreeSide(stance: Stance): 'left' | 'right' | 'center' {
  if (stance === 'concur') return 'left';
  if (stance === 'counter') return 'right';
  return 'center';
}

function getConnectorSide(treeSide: 'left' | 'right' | 'center'): 'left' | 'right' {
  return treeSide === 'right' ? 'right' : 'left';
}

function stanceMeta(stance: Stance) {
  if (stance === 'concur') {
    return { icon: '👍', label: 'Support', border: 'var(--concur-button)' };
  }
  if (stance === 'counter') {
    return { icon: '👎', label: 'Oppose', border: 'var(--counter-button)' };
  }
  return { icon: '💬', label: 'Discuss', border: 'var(--discuss-border)' };
}

// Vote control
const VoteControl: React.FC<{ commentId: string; score: number }> = ({ commentId, score }) => {
  const userVotes = useForumStore((s) => s.userVotes);
  const vote = useForumStore((s) => s.vote);
  const current = userVotes.get(commentId) ?? null;

  return (
    <TrustGate fallback={null}>
      <div className="flex flex-col items-center gap-0.5 text-xs">
        <button
          className={`rounded px-1 hover:bg-slate-100 dark:hover:bg-slate-800 ${
            current === 'up' ? 'text-teal-600' : 'text-slate-400'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            void vote(commentId, current === 'up' ? null : 'up');
          }}
          aria-label="Upvote"
        >
          ▲
        </button>
        <span className="font-mono">{score}</span>
        <button
          className={`rounded px-1 hover:bg-slate-100 dark:hover:bg-slate-800 ${
            current === 'down' ? 'text-amber-600' : 'text-slate-400'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            void vote(commentId, current === 'down' ? null : 'down');
          }}
          aria-label="Downvote"
        >
          ▼
        </button>
      </div>
    </TrustGate>
  );
};

// SVG branch connector (trunk → curve → horizontal)
interface BranchProps {
  side: 'left' | 'right';
}

const BranchConnector: React.FC<BranchProps> = ({ side }) => {
  const isLeft = side === 'left';
  const curveRadius = 6;
  const width = INDENT_PX;
  const branchY = BRANCH_HEIGHT;
  
  // SVG coordinates - the trunk is at position 0 (left) or width (right)
  // We draw from trunk, curve, then horizontal to card edge
  const trunkX = isLeft ? LINE_WIDTH / 2 : width - LINE_WIDTH / 2;
  const cardX = isLeft ? width : 0;
  
  // Path: vertical from top → curve → horizontal to card
  const path = isLeft
    ? `M ${trunkX} 0 L ${trunkX} ${branchY - curveRadius} Q ${trunkX} ${branchY} ${trunkX + curveRadius} ${branchY} L ${cardX} ${branchY}`
    : `M ${trunkX} 0 L ${trunkX} ${branchY - curveRadius} Q ${trunkX} ${branchY} ${trunkX - curveRadius} ${branchY} L ${cardX} ${branchY}`;

  return (
    <svg
      className="absolute top-0 pointer-events-none overflow-visible"
      style={{
        width,
        height: branchY + 4,
        [isLeft ? 'left' : 'right']: -width,
      }}
      aria-hidden="true"
    >
      {/* Main branch with smooth curve */}
      <path
        d={path}
        fill="none"
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Children container with trunk border
interface ChildrenContainerProps {
  side: 'left' | 'right';
  children: React.ReactNode;
}

const ChildrenContainer: React.FC<ChildrenContainerProps> = ({ side, children }) => {
  const isLeft = side === 'left';

  return (
    <div
      className="relative mt-3 space-y-3"
      style={{
        [isLeft ? 'paddingLeft' : 'paddingRight']: TRUNK_PADDING_PX,
        [isLeft ? 'borderLeft' : 'borderRight']: `${LINE_WIDTH}px solid ${LINE_COLOR}`,
      }}
    >
      {children}
    </div>
  );
};

// Comment item
interface CommentItemProps {
  threadId: string;
  comments: HermesComment[];
  comment: HermesComment;
  depth: number;
  treeSide: 'left' | 'right' | 'center';
}

const CommentItem: React.FC<CommentItemProps> = ({
  threadId,
  comments,
  comment,
  depth,
  treeSide,
}) => {
  const children = useMemo(
    () => comments.filter((c) => c.parentId === comment.id).sort((a, b) => a.timestamp - b.timestamp),
    [comments, comment.id]
  );

  const meta = stanceMeta(comment.stance);
  const score = comment.upvotes - comment.downvotes;
  const maxW = cardMaxWidth(depth);

  const [showReply, setShowReply] = useState(false);
  const [childrenCollapsed, setChildrenCollapsed] = useState(() => depth >= 3 && children.length > 0);
  const [userToggled, setUserToggled] = useState(false);

  useEffect(() => {
    if (!userToggled && depth >= 3 && children.length > 0 && !childrenCollapsed) {
      setChildrenCollapsed(true);
    }
  }, [children.length, depth, userToggled, childrenCollapsed]);

  const handleToggle = () => {
    setUserToggled(true);
    setChildrenCollapsed((v) => !v);
  };

  const isLeft = treeSide === 'left';
  const isRight = treeSide === 'right';
  const connectorSide = getConnectorSide(treeSide);

  const borderRadiusClass = isLeft
    ? 'rounded-r-lg border-l-[3px]'
    : isRight
      ? 'rounded-l-lg border-r-[3px]'
      : 'rounded-lg border-l-[3px]';

  const alignmentClass = isLeft
    ? 'justify-start'
    : isRight
      ? 'justify-end'
      : depth === 0
        ? 'justify-center'
        : 'justify-start';

  const showBranch = depth > 0;
  const hasVisibleChildren = children.length > 0 && !childrenCollapsed;

  return (
    <div className="relative" data-testid={`comment-wrap-${comment.id}`}>
      <div className={`flex ${alignmentClass}`}>
        <div className="relative w-full" style={{ maxWidth: maxW }} data-testid={`comment-frame-${comment.id}`}>
          {showBranch && <BranchConnector side={connectorSide} />}

          <div
            className={`${borderRadiusClass} p-3 shadow-sm`}
            style={{
              borderColor: meta.border,
              backgroundColor: `var(--stream-${comment.stance}-bg)`,
              width: '100%',
            }}
            data-testid={`comment-${comment.id}`}
            role="article"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span
                    className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                    aria-label={`Stance: ${meta.label}`}
                  >
                    {meta.icon} {meta.label}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {comment.author.slice(0, 10)}…
                  </span>
                  <span>• {new Date(comment.timestamp).toLocaleString()}</span>
                </div>

                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  style={{ color: 'var(--comment-text)' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.content) }}
                />

                <div className="flex items-center gap-3 text-xs">
                  <TrustGate
                    fallback={
                      <span className="text-xs text-slate-400" data-testid="reply-trust-gate">
                        Verify to reply
                      </span>
                    }
                  >
                    <button
                      className="font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReply((v) => !v);
                      }}
                      aria-label="Reply"
                      data-testid={`reply-btn-${comment.id}`}
                    >
                      ↩ Reply
                    </button>
                  </TrustGate>

                  {children.length > 0 && (
                    <button
                      className="rounded-full px-3 py-1 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--thread-muted)', backgroundColor: 'var(--stream-collapse-bg)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle();
                      }}
                      aria-expanded={!childrenCollapsed}
                      aria-label={childrenCollapsed ? `Show ${children.length} replies` : 'Collapse replies'}
                    >
                      {childrenCollapsed ? `▶ ${children.length} replies` : '▼ Collapse'}
                    </button>
                  )}
                </div>

                {showReply && (
                  <div className="mt-2">
                    <CommentComposer
                      threadId={threadId}
                      parentId={comment.id}
                      onSubmit={async () => setShowReply(false)}
                    />
                  </div>
                )}
              </div>

              <VoteControl commentId={comment.id} score={score} />
            </div>
          </div>

          {hasVisibleChildren && (
            <ChildrenContainer side={connectorSide}>
              {children.map((child) => (
                <CommentItem
                  key={child.id}
                  threadId={threadId}
                  comments={comments}
                  comment={child}
                  depth={depth + 1}
                  treeSide={treeSide}
                />
              ))}
            </ChildrenContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommentStream: React.FC<Props> = ({ threadId, comments, parentId = null, depth = 0 }) => {
  const rootComments = useMemo(
    () => comments.filter((c) => c.parentId === parentId).sort((a, b) => a.timestamp - b.timestamp),
    [comments, parentId]
  );

  return (
    <div className="space-y-4" data-testid="comment-stream">
      {rootComments.map((comment) => (
        <CommentItem
          key={comment.id}
          threadId={threadId}
          comments={comments}
          comment={comment}
          depth={depth}
          treeSide={getTreeSide(comment.stance)}
        />
      ))}
    </div>
  );
};
