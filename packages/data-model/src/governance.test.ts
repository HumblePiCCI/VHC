import { describe, it, expect } from 'vitest';
import { ProposalSchema, VoteSchema } from './schemas';
import { v4 as uuidv4 } from 'uuid';

describe('Governance Data Model', () => {
    describe('ProposalSchema', () => {
        it('should validate a correct proposal', () => {
            const validProposal = {
                id: uuidv4(),
                author: 'pubkey-123',
                title: 'A Valid Proposal Title',
                summary: 'This is a summary of the proposal.',
                fundingRequest: '1000',
                recipient: '0x1234567890abcdef',
                attestationProof: 'zk-proof-blob',
                timestamp: Date.now()
            };
            const result = ProposalSchema.safeParse(validProposal);
            expect(result.success).toBe(true);
        });

        it('should reject a proposal with a short title', () => {
            const invalidProposal = {
                id: uuidv4(),
                author: 'pubkey-123',
                title: 'Short',
                summary: 'Summary',
                fundingRequest: '1000',
                recipient: '0x123',
                attestationProof: 'proof',
                timestamp: Date.now()
            };
            const result = ProposalSchema.safeParse(invalidProposal);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('title');
            }
        });

        it('should reject a proposal with invalid funding request (negative)', () => {
            const invalidProposal = {
                id: uuidv4(),
                author: 'pubkey-123',
                title: 'Valid Title Here',
                summary: 'Summary',
                fundingRequest: '-100',
                recipient: '0x123',
                attestationProof: 'proof',
                timestamp: Date.now()
            };
            const result = ProposalSchema.safeParse(invalidProposal);
            expect(result.success).toBe(false);
        });
    });

    describe('VoteSchema', () => {
        it('should validate a correct vote', () => {
            const validVote = {
                proposalId: uuidv4(),
                amount: '500',
                direction: 'for',
                voter: 'pubkey-456'
            };
            const result = VoteSchema.safeParse(validVote);
            expect(result.success).toBe(true);
        });

        it('should reject invalid direction', () => {
            const invalidVote = {
                proposalId: uuidv4(),
                amount: '500',
                direction: 'maybe',
                voter: 'pubkey-456'
            };
            const result = VoteSchema.safeParse(invalidVote);
            expect(result.success).toBe(false);
        });
    });
});
