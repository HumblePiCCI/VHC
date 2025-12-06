/**
 * HERMES Messaging Store
 * 
 * Re-exports from modular chat/ directory for backwards compatibility.
 * See chat/index.ts for the main implementation.
 */
export { useChatStore, createRealChatStore, createMockChatStore } from './chat';
export type { ChatState, ContactRecord, MessageStatus } from './chat';
