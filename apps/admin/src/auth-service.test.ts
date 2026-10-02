import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  authenticateUser,
  validateSessionToken,
  invalidateSession,
  createPasswordResetRequest,
  resetPasswordWithToken,
  changeUserPassword,
} from './lib/auth-service';

describe('Secure User Authentication & Login System', () => {
  it('authenticates valid admin credentials and returns session token', async () => {
    const result = await authenticateUser('admin@headless.io', 'AdminPass123!', true);
    assert.equal(result.success, true);
    assert.ok(result.token, 'Should return a cryptographically secure session token');
    assert.equal(result.user?.email, 'admin@headless.io');
    assert.equal(result.user?.role, 'super_admin');
    assert.ok(result.expiresAt, 'Should include expiration date');
  });

  it('rejects incorrect passwords and returns descriptive error', async () => {
    const result = await authenticateUser('admin@headless.io', 'WrongPassword999!');
    assert.equal(result.success, false);
    assert.match(result.error || '', /Invalid email or password/);
  });

  it('validates active session tokens and returns user context', async () => {
    const loginResult = await authenticateUser('editor@headless.io', 'EditorPass123!');
    assert.ok(loginResult.token);

    const user = await validateSessionToken(loginResult.token);
    assert.ok(user, 'Session token should resolve to a valid user');
    assert.equal(user?.email, 'editor@headless.io');
    assert.equal(user?.role, 'editor');

    // Invalid token returns null
    const invalidUser = await validateSessionToken('bogus_fake_token_12345');
    assert.equal(invalidUser, null);
  });

  it('invalidates sessions upon logout', async () => {
    const loginResult = await authenticateUser('author@headless.io', 'AuthorPass123!');
    assert.ok(loginResult.token);

    // Invalidate
    await invalidateSession(loginResult.token);

    // Token should no longer be valid
    const userAfter = await validateSessionToken(loginResult.token);
    assert.equal(userAfter, null);
  });

  it('handles password reset requests and token verification', async () => {
    const resetReq = await createPasswordResetRequest('reviewer@headless.io', 'http://localhost:3001');
    assert.equal(resetReq.success, true);
    assert.ok(resetReq.demoResetUrl);

    const url = new URL(resetReq.demoResetUrl);
    const token = url.searchParams.get('token');
    assert.ok(token, 'Should generate a reset token');

    // Reset with too short password should fail
    const shortRes = await resetPasswordWithToken(token, 'short');
    assert.equal(shortRes.success, false);
    assert.match(shortRes.error || '', /at least 8 characters/);

    // Reset with valid strong password
    const validRes = await resetPasswordWithToken(token, 'NewSecurePass2026!');
    assert.equal(validRes.success, true);

    // Can now log in with the new password
    const loginWithNew = await authenticateUser('reviewer@headless.io', 'NewSecurePass2026!');
    assert.equal(loginWithNew.success, true);
  });

  it('prevents unauthorized password changes without current password', async () => {
    const changeRes = await changeUserPassword('user_admin_01', 'IncorrectOldPass!', 'NewPass2026!xyz');
    assert.equal(changeRes.success, false);
    assert.match(changeRes.error || '', /Current password is incorrect/);
  });
});
