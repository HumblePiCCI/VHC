/**
 * HERMES Forum Store
 * 
 * Re-exports from modular forum/ directory for backwards compatibility.
 * See forum/index.ts for the main implementation.
 */
export { useForumStore, createForumStore, createMockForumStore, stripUndefined } from './forum';
export type { ForumState } from './forum';
