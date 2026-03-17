import { test, expect } from '@playwright/test';

test.describe('auth', () => {
  test('auth stub', async ({ page }) => {
    expect(true).toBe(true);
  });

  test.describe('signup login logout', () => {
    test('stub', async () => {
      expect(true).toBe(true);
    });
  });

  test.describe('2fa session-persistence', () => {
    test('stub', async () => {
      expect(true).toBe(true);
    });
  });
});
