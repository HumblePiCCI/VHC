import { create } from 'zustand';
import { HermesCommentSchema, HermesThreadSchema } from '@vh/data-model';
import type { HermesComment, HermesThread } from '@vh/types';
import type { ForumState } from './types';
import { loadIdentity, loadVotesFromStorage, persistVotes } from './persistence';
import { ensureIdentity, stripUndefined, serializeThreadForGun, parseThreadFromGun, addComment } from './helpers';

export function createMockForumStore() {
  const mesh = (() => {
    const w = globalThis as any;
    if (typeof w.__vhMeshWrite === 'function' && typeof w.__vhMeshList === 'function') {
      return {
        write: (path: string, value: any) => w.__vhMeshWrite(path, value),
        list: (prefix: string) => w.__vhMeshList(prefix) as any[]
      };
    }
    return null;
  })();

  const identity = loadIdentity();
  const initialVotes = identity?.session?.nullifier ? loadVotesFromStorage(identity.session.nullifier) : new Map();

  const store = create<ForumState>((set, get) => ({
    threads: new Map(),
    comments: new Map(),
    userVotes: initialVotes,
    async createThread(title, content, tags, sourceAnalysisId) {
      const identity = ensureIdentity();
      const thread: HermesThread = {
        id: `mock-thread-${Date.now()}`,
        schemaVersion: 'hermes-thread-v0',
        title,
        content,
        author: identity.session.nullifier,
        timestamp: Date.now(),
        tags,
        ...(sourceAnalysisId ? { sourceAnalysisId } : {}),
        upvotes: 0,
        downvotes: 0,
        score: 0
      };
      const cleanThread = stripUndefined(thread);
      const nextThreads = new Map(get().threads).set(cleanThread.id, cleanThread as HermesThread);
      set((state) => ({ ...state, threads: nextThreads }));
      const threadForMesh = serializeThreadForGun(cleanThread as HermesThread);
      mesh?.write(`vh/forum/threads/${cleanThread.id}`, threadForMesh);
      return cleanThread as HermesThread;
    },
    async createComment(threadId, content, type, parentId, targetId) {
      ensureIdentity();
      const comment: HermesComment = {
        id: `mock-comment-${Date.now()}`,
        schemaVersion: 'hermes-comment-v0',
        threadId,
        parentId: parentId ?? null,
        content,
        author: 'mock-author',
        timestamp: Date.now(),
        type,
        targetId,
        upvotes: 0,
        downvotes: 0
      };
      const cleanComment = stripUndefined(comment);
      set((state) => addComment(state, cleanComment as HermesComment));
      mesh?.write(`vh/forum/threads/${threadId}/comments/${cleanComment.id}`, cleanComment);
      return cleanComment as HermesComment;
    },
    async vote(targetId, direction) {
      const identity = ensureIdentity();
      const previous = get().userVotes.get(targetId) ?? null;
      if (previous === direction) return;
      set((state) => {
        const nextVotes = new Map(state.userVotes).set(targetId, direction);
        persistVotes(identity.session.nullifier, nextVotes);
        return { ...state, userVotes: nextVotes };
      });
    },
    async loadThreads() {
      return Array.from(get().threads.values());
    },
    async loadComments(threadId) {
      return get().comments.get(threadId) ?? [];
    }
  }));

  if (mesh) {
    Promise.resolve(mesh.list('vh/forum/threads/')).then((items) => {
      const threads = new Map<string, HermesThread>();
      const comments = new Map<string, HermesComment[]>();
      (items ?? []).forEach((entry: any) => {
        const value = entry.value ?? entry;
        if (value?.schemaVersion === 'hermes-thread-v0') {
          const parsed = parseThreadFromGun(value as Record<string, unknown>);
          const validated = HermesThreadSchema.safeParse(parsed);
          if (validated.success) threads.set(validated.data.id, validated.data);
        } else if (value?.schemaVersion === 'hermes-comment-v0') {
          const entryPath = entry.path ?? '';
          const match = entryPath.match(/vh\/forum\/threads\/([^/]+)\/comments/);
          const threadId = match?.[1] ?? value.threadId;
          if (threadId) {
            const validated = HermesCommentSchema.safeParse(value);
            if (validated.success) {
              const list = comments.get(threadId) ?? [];
              if (!list.some((c) => c.id === validated.data.id)) {
                list.push(validated.data);
                comments.set(threadId, list);
              }
            }
          }
        }
      });
      store.setState((state) => ({ ...state, threads, comments }));
    });
  }

  return store;
}

