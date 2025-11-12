/**
 * Onboarding E2E Tests - Device Issues
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Device Issues', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/onboarding');
  });

  test('should show troubleshooting when camera permission denied', async ({ page, context }) => {
    // Deny camera permission
    await context.grantPermissions([]);

    // Navigate to device setup
    await page.getByRole('button', { name: /next/i }).click();

    // Click test devices
    await page.getByRole('button', { name: /test my devices/i }).click();

    // Wait for test to complete
    await page.waitForTimeout(2000);

    // Should show troubleshooting tips
    await expect(page.getByText(/troubleshooting tips/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/camera not accessible/i)).toBeVisible();

    // Should show retry button
    await expect(page.getByRole('button', { name: /test again/i })).toBeVisible();
  });

  test('should display privacy notice about device permissions', async ({ page }) => {
    await page.getByRole('button', { name: /next/i }).click();

    // Privacy notice should be visible
    await expect(page.getByText(/privacy note/i)).toBeVisible();
    await expect(page.getByText(/we never record or store any audio or video without your explicit consent/i)).toBeVisible();
  });

  test('should allow proceeding even with device issues', async ({ page, context }) => {
    await context.grantPermissions([]);

    // Navigate to device setup
    await page.getByRole('button', { name: /next/i }).click();

    // Test devices (will fail)
    await page.getByRole('button', { name: /test my devices/i }).click();
    await page.waitForTimeout(2000);

    // Should still allow proceeding to next step
    await expect(page.getByRole('button', { name: /next/i })).toBeEnabled();
    await page.getByRole('button', { name: /next/i }).click();

    // Should move to profile step
    await expect(page.getByRole('heading', { name: 'Complete Your Profile' })).toBeVisible();
  });
});
