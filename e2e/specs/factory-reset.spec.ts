/**
 * CUJ: Factory Reset and New User Experience
 * 
 * Verifies that:
 *   - Current user is TESTUSER initially
 *   - Factory reset wipes all data (DBs and media)
 *   - App prompts for a new user name after reset
 *   - New user "BESTUSER" can be created
 *   - Dashboard and Library are empty after reset
 *   - Profile tab shows the new user name "BESTUSER"
 */

import { waitForAppReady } from '../helpers/setup.js';
import {
  navigateTo,
  verifyActiveView,
  submitPrompt
} from '../helpers/interactions.js';

describe('Factory Reset CUJ', () => {
  before(async () => {
    // We set the profile in localStorage and THEN refresh to ensure the app picks it up
    await browser.execute(() => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('kechimochi_profile', 'TESTUSER');
    });
    await browser.refresh(); 
    await waitForAppReady();
  });

  it('1-3) should launch app, navigate to profile, and verify current profile is TESTUSER', async () => {
    await navigateTo('profile');
    expect(await verifyActiveView('profile')).toBe(true);
    
    // Verify current profile is "TESTUSER" (h2 header in ProfileView)
    const profileName = await $('h2');
    expect(await profileName.getText()).toBe('TESTUSER');
  });

  it('4-5) should perform factory reset and wipe all data', async () => {
    const wipeBtn = await $('#profile-btn-wipe-everything');
    await browser.execute((el: HTMLElement) => el.scrollIntoView(), wipeBtn);
    await wipeBtn.click();

    // Handle the wipe confirmation prompt
    await submitPrompt('WIPE_EVERYTHING');

    // After reset, the app should reload. 
    // We expect the "initial profile prompt" to appear.
    const initialInput = await $('#initial-prompt-input');
    await initialInput.waitForDisplayed({ timeout: 10000 });
  });

  it('6-7) should prompt for a new user name and create BESTUSER', async () => {
    const initialInput = await $('#initial-prompt-input');
    await initialInput.setValue('BESTUSER');

    const startBtn = await $('#initial-prompt-confirm');
    await startBtn.click();

    // App should navigate to dashboard after creation
    await (await $('[data-view="dashboard"]')).waitForDisplayed();
    expect(await verifyActiveView('dashboard')).toBe(true);
  });

  it('8) should verify dashboard is empty', async () => {
    // Navigate to dashboard (already there, but to be sure)
    await navigateTo('dashboard');
    
    // Check for "No activity logged yet." empty state indicator
    const emptyState = await $('p=No activity logged yet.');
    expect(await emptyState.isDisplayed()).toBe(true);

    // Verify "TESTUSER" is not visible anymore
    const bodyText = await $('body').getText();
    expect(bodyText).not.toContain('TESTUSER');
  });

  it('9) should verify library page is empty', async () => {
    await navigateTo('media');
    
    // In media grid, check that no media items are displayed.
    const mediaItems = await $$('.media-grid-item');
    expect(mediaItems.length).toBe(0);
  });

  it('10) should verify profile name is BESTUSER', async () => {
    await navigateTo('profile');
    expect(await verifyActiveView('profile')).toBe(true);

    const profileName = await $('h2');
    expect(await profileName.getText()).toBe('BESTUSER');
    
    const bodyText = await $('body').getText();
    expect(bodyText).not.toContain('TESTUSER');
  });
});
