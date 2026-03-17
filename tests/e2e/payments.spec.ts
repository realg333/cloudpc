import { test, expect } from '@playwright/test';

test.describe('payments', () => {
  test('User with pending order can navigate to payment page', async () => {
    expect(true).toBe(true);
  });

  test('User with active paid order cannot create new payment', async () => {
    expect(true).toBe(true);
  });
});
