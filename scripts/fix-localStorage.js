/**
 * Fix MeetSolis localStorage - Reset maxTilesVisible
 *
 * Run this in browser console (F12 → Console):
 * 1. Copy this entire file content
 * 2. Paste in console
 * 3. Press Enter
 * 4. Reload the page
 */

(function fixMeetSolisStorage() {
  console.log('🔧 Fixing MeetSolis localStorage...');

  // Get current settings
  const key = 'meetsolis_layout_preferences';
  const current = localStorage.getItem(key);

  console.log('Current settings:', current);

  if (!current) {
    console.log('✅ No settings found - will use defaults');
    return;
  }

  try {
    const parsed = JSON.parse(current);

    // Check if maxTilesVisible needs fixing
    if (parsed.maxTilesVisible && parsed.maxTilesVisible < 9) {
      console.log(`⚠️  Found invalid maxTilesVisible: ${parsed.maxTilesVisible}`);

      // Fix it
      parsed.maxTilesVisible = 16; // Default to 16 (4x4 grid before pagination)

      // Save back
      localStorage.setItem(key, JSON.stringify(parsed));

      console.log('✅ Fixed! New settings:', JSON.stringify(parsed, null, 2));
      console.log('🔄 Please reload the page');
    } else {
      console.log('✅ Settings are correct - no fix needed');
    }
  } catch (e) {
    console.error('❌ Error:', e);
    console.log('Clearing all settings...');
    localStorage.removeItem(key);
    console.log('✅ Cleared - will use defaults. Please reload.');
  }
})();
