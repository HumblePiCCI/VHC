import React, { useMemo, useState } from 'react';
import type { HermesComment } from '@vh/types';
import { useForumStore } from '../../store/hermesForum';
import { renderMarkdown } from '../../utils/markdown';
import { CommentComposer } from './forum/CommentComposer';
import { TrustGate } from './forum/TrustGate';
import { useSentimentState } from '../../hooks/useSentimentState';
import { EngagementIcons } from '../EngagementIcons';
import { useViewTracking } from '../../hooks/useViewTracking';

interface Props {
  comment: HermesComment;
  allComments: HermesComment[];
  depth?: number;
}

export const CommentCard: React.FC<Props> = ({ comment, allComments, depth = 0 }) => {
  const userVotes = useForumStore((s) => s.userVotes);
  const vote = useForumStore((s) => s.vote);
  const [showReply, setShowReply] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const eyeWeight = useSentimentState((s) => s.getEyeWeight(comment.id));
  const lightbulbWeight = useSentimentState((s) => s.getLightbulbWeight(comment.id));
  useViewTracking(comment.id, !isCollapsed);

  const score = comment.upvotes - comment.downvotes;

  const children = useMemo(() => {
    return allComments
      .filter((c) => c.parentId === comment.id)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [allComments, comment.id]);

  const getStanceColor = () => {
    if (comment.stance === 'concur') return 'bg-teal-50/50 dark:bg-teal-900/10';
    if (comment.stance === 'counter') return 'bg-amber-50/50 dark:bg-amber-900/10';
    return 'bg-slate-50/50 dark:bg-slate-800/10';
  };
  
  const getBorderColor = () => {
    if (comment.stance === 'concur') return '#14b8a6'; // teal-500
    if (comment.stance === 'counter') return '#f59e0b'; // amber-500
    return '#94a3b8'; // slate-400
  };
  
  const stanceBadgeColor = () => {
     if (comment.stance === 'concur') return 'text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400';
     if (comment.stance === 'counter') return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
     return 'text-slate-600 bg-slate-100 dark:bg-slate-800/30 dark:text-slate-400';
  };
  
  const stanceIcon = () => {
      if (comment.stance === 'concur') return '👍';
      if (comment.stance === 'counter') return '👎';
      return '💬';
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? 'mt-3' : ''}`}>
      <div 
        className={`relative rounded-r-lg border-l-4 p-3 shadow-sm transition-all hover:shadow-md ${getStanceColor()}`}
        style={{ borderColor: getBorderColor() }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 text-sm w-full">
            <div className="flex items-center gap-2 text-xs text-slate-500">
               <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${stanceBadgeColor()}`}>
                 {stanceIcon()} {comment.stance === 'discuss' ? 'Discuss' : comment.stance}
               </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {comment.author.slice(0, 10)}…
              </span>
              <span>• {new Date(comment.timestamp).toLocaleString()}</span>
              {children.length > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
                  className="ml-2 hover:underline text-slate-400 hover:text-slate-600"
                >
                  [{isCollapsed ? `+${children.length} replies` : '–'}]
                </button>
              )}
            </div>
            
            {!isCollapsed && (
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                style={{ color: 'var(--comment-text)' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.content) }}
              />
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
             {!isCollapsed && <EngagementIcons eyeWeight={eyeWeight} lightbulbWeight={lightbulbWeight} />}
             <TrustGate fallback={null}>
                <div className="flex flex-col items-center gap-0.5 text-xs">
                  <button
                    className={`rounded px-1 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      userVotes.get(comment.id) === 'up' ? 'text-teal-600' : 'text-slate-400'
                    }`}
                    onClick={(e) => { e.stopPropagation(); vote(comment.id, userVotes.get(comment.id) === 'up' ? null : 'up'); }}
                  >▲</button>
                  <span className="font-mono">{score}</span>
                  <button
                    className={`rounded px-1 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      userVotes.get(comment.id) === 'down' ? 'text-amber-600' : 'text-slate-400'
                    }`}
                    onClick={(e) => { e.stopPropagation(); vote(comment.id, userVotes.get(comment.id) === 'down' ? null : 'down'); }}
                  >▼</button>
                </div>
             </TrustGate>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex gap-2 text-xs mt-2">
            <button
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowReply(!showReply);
              }}
            >
              ↩ Reply
            </button>
          </div>
        )}
      </div>

      {showReply && !isCollapsed && (
        <div className="ml-4">
           <CommentComposer
             threadId={comment.threadId}
             parentId={comment.id}
             onSubmit={async () => setShowReply(false)}
           />
        </div>
      )}

      {!isCollapsed && children.length > 0 && (
        <div className={`border-l-2 border-slate-200 dark:border-slate-800 ml-2 pl-2`}> 
           {children.map((child) => (
             <CommentCard 
               key={child.id} 
               comment={child} 
               allComments={allComments} 
               depth={depth + 1}
             />
           ))}
        </div>
      )}
    </div>
  );
};
