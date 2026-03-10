import { waitForAppReady } from '../helpers/setup.js';
import { 
    navigateTo, 
    setSearchQuery, 
    setMediaTypeFilter, 
    setTrackingStatusFilter, 
    setHideArchived, 
    isMediaVisible 
} from '../helpers/interactions.js';

describe('CUJ: Library Exploration (Search & Filter)', () => {
    before(async () => {
        await waitForAppReady();
    });

    it('should filter library results correctly', async () => {
        // 1) Open the app and navigate to "Library" via the navbar
        await navigateTo('media');

        // 2) Locate the search bar & 3) Type "呪術" and verify "呪術廻戦" remains visible
        await setSearchQuery('呪術');
        expect(await isMediaVisible('呪術廻戦')).toBe(true);
        // Verify unrelated entry (e.g., 'ペルソナ5') disappeared
        expect(await isMediaVisible('ペルソナ5')).toBe(false);

        // 4) Clear the search input
        await setSearchQuery('');
        expect(await isMediaVisible('ペルソナ5')).toBe(true);

        // 5) Open the activity type filter dropdown and select "Manga"
        await setMediaTypeFilter('Manga');

        // 6) Verify that only Manga entries are displayed in the grid
        expect(await isMediaVisible('呪術廻戦')).toBe(true);
        expect(await isMediaVisible('ダンジョン飯')).toBe(true); 
        expect(await isMediaVisible('ペルソナ5')).toBe(false);

        // 7) Open the tracking status filter and select "Ongoing"
        await setTrackingStatusFilter('Ongoing');

        // 8) Verify that the displayed entries are both Manga and Ongoing
        // '呪術廻戦' was updated to 'Ongoing' in seed.ts for this test
        expect(await isMediaVisible('呪術廻戦')).toBe(true); 
        expect(await isMediaVisible('ダンジョン飯')).toBe(false); // This is 'Complete' tracking status

        // 9) Toggle the "Hide Archived" checkbox
        await setHideArchived(true);

        // 10) Verify that any media with the status "Archived" disappears
        // '呪術廻戦' has status 'Completed' which counts as archived in the app logic
        expect(await isMediaVisible('呪術廻戦')).toBe(false);
        
        // Reset "Hide Archived" and filters to verify visibility again
        await setHideArchived(false);
        expect(await isMediaVisible('呪術廻戦')).toBe(true);

        await setMediaTypeFilter('All');
        await setTrackingStatusFilter('All');
        expect(await isMediaVisible('ペルソナ5')).toBe(true);
    });
});
