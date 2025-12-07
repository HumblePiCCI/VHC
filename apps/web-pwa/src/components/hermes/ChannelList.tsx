import React from 'react';
import type { HermesChannel, HermesMessage } from '@vh/types';
import type { ContactRecord } from '../../store/hermesMessaging';

interface Props {
  channels: HermesChannel[];
  messages: Map<string, HermesMessage[]>;
  activeChannelId?: string;
  contacts: Map<string, ContactRecord>;
  currentUser?: string | null;
  onSelect: (channelId: string) => void;
}

export const ChannelList: React.FC<Props> = ({ channels, messages, activeChannelId, onSelect, contacts, currentUser }) => {
  const sorted = [...channels].sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
  const handleOccurrences = new Map<string, string[]>();
  contacts.forEach((record) => {
    if (record.handle) {
      const existing = handleOccurrences.get(record.handle) ?? [];
      handleOccurrences.set(record.handle, [...existing, record.nullifier]);
    }
  });
  const formatDisplay = (peer: string): string => {
    const contact = contacts.get(peer);
    if (contact?.handle) {
      const peersWithHandle = handleOccurrences.get(contact.handle) ?? [];
      const index = peersWithHandle.indexOf(peer);
      const discriminator = peersWithHandle.length > 1 && index >= 0 ? ` (${index + 1})` : '';
      return `${contact.handle}${discriminator}`;
    }
    if (contact?.displayName) return contact.displayName;
    return peer.length > 12 ? `${peer.slice(0, 6)}…${peer.slice(-4)}` : peer;
  };

  return (
    <div className="space-y-2">
      {sorted.length === 0 && <p className="text-sm text-slate-500">No conversations yet.</p>}
      {sorted.map((channel) => {
        const last = (messages.get(channel.id) ?? []).slice(-1)[0];
        const peer =
          channel.participants.find((p) => p !== currentUser) ??
          channel.participants.find((p) => p !== channel.participants[0]) ??
          channel.participants[0];
        return (
          <button
            key={channel.id}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
              activeChannelId === channel.id
                ? 'border-teal-300 bg-teal-50 dark:border-emerald-500/60 dark:bg-emerald-900/30'
                : 'border-slate-200 hover:border-teal-200 dark:border-slate-700 dark:hover:border-emerald-600/60'
            }`}
            data-testid={`channel-${channel.id}`}
            onClick={() => onSelect(channel.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{peer ? formatDisplay(peer) : ''}</span>
              <span className="text-[11px] text-slate-500">{last ? new Date(last.timestamp).toLocaleTimeString() : ''}</span>
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-slate-600 dark:text-slate-300">
              {last ? last.content.slice(0, 40) : 'No messages yet'}
            </p>
          </button>
        );
      })}
    </div>
  );
};
