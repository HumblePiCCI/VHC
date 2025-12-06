import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Zod optional behavior', () => {
  const Schema = z.object({
    id: z.string(),
    optionalField: z.string().optional()
  });

  it('should omit optional key if missing in input', () => {
    const input = { id: '1' };
    const output = Schema.parse(input);
    expect(Object.prototype.hasOwnProperty.call(output, 'optionalField')).toBe(false);
    expect(output.optionalField).toBe(undefined);
    expect(Object.keys(output)).toEqual(['id']);
  });

  it('should include optional key as undefined if explicitly undefined in input', () => {
    const input = { id: '2', optionalField: undefined };
    const output = Schema.parse(input);
    
    // This is the critical check: does Zod strip explicit undefined?
    // By default, Zod strips unknown keys, but undefined for a known optional field?
    expect(Object.prototype.hasOwnProperty.call(output, 'optionalField')).toBe(true);
    expect(output.optionalField).toBe(undefined);
    expect(Object.keys(output)).toContain('optionalField');
  });
});
