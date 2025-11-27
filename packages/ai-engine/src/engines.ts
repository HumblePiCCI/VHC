export interface JsonCompletionEngine {
    name: string;
    kind: 'local' | 'remote';
    generate(prompt: string): Promise<string>;
}

export type EnginePolicy =
    | 'remote-first'
    | 'local-first'
    | 'remote-only'
    | 'local-only'
    | 'shadow';

export class EngineRouter {
    constructor(
        private localEngine?: JsonCompletionEngine,
        private remoteEngine?: JsonCompletionEngine,
        private policy: EnginePolicy = 'local-first'
    ) { }

    async generate(prompt: string): Promise<{ text: string; engine: string }> {
        // Simple implementation for now, can be expanded for full policy support
        if (this.policy === 'local-only' || (this.policy === 'local-first' && this.localEngine)) {
            if (!this.localEngine) throw new Error('Local engine required but not available');
            return {
                text: await this.localEngine.generate(prompt),
                engine: this.localEngine.name
            };
        }

        if (this.policy === 'remote-only' || (this.policy === 'remote-first' && this.remoteEngine)) {
            if (!this.remoteEngine) throw new Error('Remote engine required but not available');
            return {
                text: await this.remoteEngine.generate(prompt),
                engine: this.remoteEngine.name
            };
        }

        throw new Error(`No engine available for policy: ${this.policy}`);
    }
}
