/**
 * Onboarding E2E Tests - Happy Path
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Happy Path', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear local storage before each test
    await context.clearCookies();
    await page.goto('/onboarding');
  });

  test('should complete full onboarding flow successfully', async ({ page, context }) => {
    // Grant permissions
    await context.grantPermissions(['camera', 'microphone']);

    // Step 1: Welcome
    await expect(page.getByRole('heading', { name: 'Welcome to MeetSolis' })).toBeVisible();
    await expect(page.getByText('HD Video Calls')).toBeVisible();
    await expect(page.getByText('Team Collaboration')).toBeVisible();

    // Progress indicator should show all steps
    await expect(page.getByText('Welcome to MeetSolis')).toBeVisible();
    await expect(page.getByText('Device Setup')).toBeVisible();
    await expect(page.getByText('Profile Setup')).toBeVisible();
    await expect(page.getByText('First Meeting')).toBeVisible();

    // Click Next to proceed
    await page.getByRole('button', { name: /next/i }).click();

    // Step 2: Device Permissions
    await expect(page.getByRole('heading', { name: 'Device Setup' })).toBeVisible();
    await page.getByRole('button', { name: /test my devices/i }).click();

    // Wait for device testing to complete
    await expect(page.getByText(/testing your devices/i)).toBeVisible();
    await expect(page.getByText(/camera/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /next/i }).click();

    // Step 3: Profile Setup (Optional - can skip)
    await expect(page.getByRole('heading', { name: 'Complete Your Profile' })).toBeVisible();
    await expect(page.getByRole('button', { name: /skip/i })).toBeVisible();

    // Fill in profile
    await page.getByPlaceholder('How should we call you?').fill('Test User');
    await page.getByPlaceholder(/product manager/i).fill('QA Tester');

    await page.getByRole('button', { name: /next/i }).click();

    // Step 4: First Meeting
    await expect(page.getByRole('heading', { name: 'Create Your First Meeting' })).toBeVisible();

    await page.getByPlaceholder(/team standup/i).fill('My Test Meeting');
    await page.getByRole('button', { name: /create demo meeting/i }).click();

    // Success state
    await expect(page.getByText(/congratulations/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/you've successfully set up your meetsolis account/i)).toBeVisible();

    // Complete button should redirect to dashboard
    await page.getByRole('button', { name: /complete/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should allow skipping optional steps', async ({ page, context }) => {
    await context.grantPermissions(['camera', 'microphone']);

    await page.goto('/onboarding');

    // Welcome step
    await page.getByRole('button', { name: /next/i }).click();

    // Device permissions
    await page.getByRole('button', { name: /test my devices/i }).click();
    await page.waitForTimeout(2000); // Wait for test to complete
    await page.getByRole('button', { name: /next/i }).click();

    // Profile step - skip this
    await expect(page.getByRole('button', { name: /skip/i })).toBeVisible();
    await page.getByRole('button', { name: /skip/i }).click();

    // Should move to first meeting step
    await expect(page.getByRole('heading', { name: 'Create Your First Meeting' })).toBeVisible();
  });

  test('should persist progress and allow resuming', async ({ page }) => {
    await page.goto('/onboarding');

    // Complete welcome step
    await page.getByRole('button', { name: /next/i }).click();

    // We're now on device setup
    await expect(page.getByRole('heading', { name: 'Device Setup' })).toBeVisible();

    // Reload page
    await page.reload();

    // Should resume from device setup step
    await expect(page.getByRole('heading', { name: 'Device Setup' })).toBeVisible();
  });

  test('should show time estimates for each step', async ({ page }) => {
    await page.goto('/onboarding');

    // Check for time estimate display
    await expect(page.getByText(/estimated time/i)).toBeVisible();
    await expect(page.getByText('30s')).toBeVisible(); // Welcome step estimate
  });

  test('should navigate back to previous steps', async ({ page }) => {
    await page.goto('/onboarding');

    // Move forward two steps
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Should be on profile step
    await expect(page.getByRole('heading', { name: 'Complete Your Profile' })).toBeVisible();

    // Go back
    await page.getByRole('button', { name: /previous/i }).click();

    // Should be on device setup
    await expect(page.getByRole('heading', { name: 'Device Setup' })).toBeVisible();
  });
});
