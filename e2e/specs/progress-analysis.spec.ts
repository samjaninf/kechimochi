import { waitForAppReady } from '../helpers/setup.js';
import { 
    navigateTo, 
    verifyActiveView, 
    clickMediaItem,
    addExtraField,
    calculateReport,
    getProjectionValue,
    logActivityGlobal,
    clickBackButton
} from '../helpers/interactions.js';

describe('CUJ: Progress Analysis (Projections)', () => {
    before(async () => {
        await waitForAppReady();
    });

    it('should calculate reading speeds and show correct projections per media type', async () => {
        // 1) Seed Calculations for different media types
        
        // Manga: ダンジョン飯 (30 mins logged). Set 3000 chars -> 6000 char/hr
        await navigateTo('media');
        await clickMediaItem('ダンジョン飯');
        await addExtraField('Character count', '3000');
        await clickBackButton();

        // Novel: ある魔女が死ぬまで (285 mins logged). Set 14250 chars -> 3000 char/hr
        await clickMediaItem('ある魔女が死ぬまで');
        await addExtraField('Character count', '14250');
        await clickBackButton();

        // Visual Novel: STEINS;GATE (210 mins logged). Set 31500 chars -> 9000 char/hr
        await clickMediaItem('STEINS;GATE');
        await addExtraField('Character count', '31500');

        // 2) Calculate Report in Profile
        await navigateTo('profile');
        await calculateReport();

        // 3) Verify Projections (Cross-Type Isolation)
        
        // Case A: Manga (呪術廻戦) - Should use 6000 char/hr
        // Initial state: 45 mins logged.
        await navigateTo('media');
        await clickMediaItem('呪術廻戦');
        await addExtraField('Character count', '6000');
        // Est. total: 6000 / 6000 = 1h = 60m. 
        // Est. remaining: 60 - 45 = 15m.
        // Completion rate: 45/60 = 75%.
        expect(await getProjectionValue('est-remaining-time')).toBe('15min');
        expect(await getProjectionValue('est-completion-rate')).toBe('75%');
        await clickBackButton();

        // Case B: Novel (薬屋のひとりごと) - Should use 3000 char/hr
        // Initial state: 40+55+35+45+50 = 225 mins logged.
        await clickMediaItem('薬屋のひとりごと');
        await addExtraField('Character count', '15000');
        // Est. total: 15000 / 3000 = 5h = 300m.
        // Est. remaining: 300 - 225 = 75m = 1h15min.
        // Completion rate: 225/300 = 75%.
        expect(await getProjectionValue('est-remaining-time')).toBe('1h15min');
        expect(await getProjectionValue('est-completion-rate')).toBe('75%');

        // 4) Verify Dynamic Update
        // Log 30 more mins for 呪術廻戦
        await logActivityGlobal('呪術廻戦', 30);
        
        // Navigate back to check (should have refreshed)
        await navigateTo('media');
        await clickMediaItem('呪術廻戦');
        
        // Final state: 75 mins logged (Total est was 60m).
        expect(await getProjectionValue('est-remaining-time')).toBe('0min');
        expect(await getProjectionValue('est-completion-rate')).toBe('100%');
    });
});
