import { waitForAppReady } from '../helpers/setup.js';
import { 
    navigateTo, 
    verifyActiveView, 
    addMedia,
    clickMediaItem,
    fetchMetadata,
    confirmMerge,
    getDescription,
    getExtraField,
    toggleImportCheckbox,
    verifyDiffDisplayed
} from '../helpers/interactions.js';

describe('CUJ: Information Enrichment (Mocked Metadata Fetching)', () => {
    before(async () => {
        await waitForAppReady();
    });

    it('should fetch metadata and handle conflicts/diffs correctly', async () => {
        // 1) Navigate to Library
        await navigateTo('media');
        expect(await verifyActiveView('media')).toBe(true);

        // 2) Add new media "STEINS;GATE 0" (Visual Novel)
        await addMedia('STEINS;GATE 0', 'Reading', 'Visual Novel'); 
        
        // 3) Pre-fill fields for conflict testing
        const mockData = {
            title: "STEINS;GATE 0",
            description: "New scraped description",
            coverImageUrl: "https://example.com/new_cover.jpg",
            extraData: {
                "Developer": "MAGES. / 5pb.",
                "Release Date": "2015-12-10",
                "Conflicts": "New value",
                "Stay": "New value"
            }
        };

        await browser.execute((data) => {
            (window as any).mockMetadata = data;
            (window as any).mockDownloadedImagePath = "/mock/path/to/cover.jpg";
        }, mockData);

        // UI Steps to set initial state
        // Add extra field "Conflicts"
        await $('#btn-add-extra').click();
        await import('../helpers/interactions.js').then(m => m.submitPrompt('Conflicts'));
        await import('../helpers/interactions.js').then(m => m.submitPrompt('Old value'));

        // Add extra field "Stay"
        await $('#btn-add-extra').click();
        await import('../helpers/interactions.js').then(m => m.submitPrompt('Stay'));
        await import('../helpers/interactions.js').then(m => m.submitPrompt('Original'));

        // Set initial description
        await import('../helpers/interactions.js').then(m => m.editDescription('Old description'));

        // 4) Trigger Fetch Metadata
        await fetchMetadata('https://vndb.org/v17102');

        // 5) Verify Diff UI
        await verifyDiffDisplayed('description', 'Old description', 'New scraped description');
        await verifyDiffDisplayed('extra-Conflicts', 'Old value', 'New value');
        await verifyDiffDisplayed('extra-Stay', 'Original', 'New value');

        // 6) Conflict Resolution: Uncheck "Stay"
        await toggleImportCheckbox('extra-Stay', false);

        // 7) Confirm Merge
        await confirmMerge();

        // 8) Verify final state
        expect(await getDescription()).toBe('New scraped description');
        expect(await getExtraField('Conflicts')).toBe('New value');
        expect(await getExtraField('Stay')).toBe('Original');
        expect(await getExtraField('Developer')).toBe('MAGES. / 5pb.');
        expect(await getExtraField('Release Date')).toBe('2015-12-10');
    });
});
