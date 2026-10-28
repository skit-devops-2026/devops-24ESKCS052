import test from 'node:test';
import assert from 'node:assert/strict';
import { generateInviteCode } from '../../src/utils/generateInviteCode.js';
test('invite code is uppercase and eight characters', () => {
    const code = generateInviteCode();
    assert.equal(code.length, 8);
    assert.match(code, /^[A-F0-9]{8}$/)
});
