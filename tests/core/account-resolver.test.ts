import { describe, it, expect } from 'vitest';
import { AccountResolver } from '../../src/core/account-resolver';
import { CHART_OF_ACCOUNTS } from '../../src/core';

describe('AccountResolver', () => {
    const resolver = new AccountResolver(CHART_OF_ACCOUNTS);

    it('should find an account by exact code (implicit in usage, via validate)', () => {
        expect(resolver.validateAccountCode('1011')).toBe(true);
        expect(resolver.validateAccountCode('99999')).toBe(false);
    });

    it('should find an account by normalized label match', () => {
        // "Capital social" is in data.json under 101
        // Note: data.json structure might vary, but "Capital social" is standard.
        // The implementation indexes normalized names.
        const code = resolver.findAccountByLabel('Capital social');
        expect(code).toBe('101');
    });

    it('should use fuzzy/keyword matching for "transport"', () => {
        const code = resolver.findAccountByLabel('Transport fees');
        expect(code).toBe('622'); // As per our heuristic in the resolver
    });

    it('should use fuzzy/keyword matching for "advertising"', () => {
        const code = resolver.findAccountByLabel('Google Ads');
        expect(code).toBe('623');
    });

    it('should return null for completely unknown labels', () => {
        const code = resolver.findAccountByLabel('Supercalifragilistic');
        expect(code).toBeNull();
    });
});
