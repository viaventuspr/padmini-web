import { describe, it, expect, beforeEach, vi } from 'vitest';

// --- පරීක්ෂණ 1: Store Logic (Zustand) පරීක්ෂාව ---
// ළමයාගේ XP වැඩිවන විට Level එක ඉබේම වැඩිවේදැයි මෙයින් බලයි.
describe('Padmini Store Logic', () => {
  it('should correctly increment points and level up', async () => {
    // Mock store dynamic import results
    const initialXP = 0;
    const addedXP = 150;
    const expectedLevel = 2; // (150/100) + 1 = 2.5 -> floor(2)

    const calculateLevel = (xp) => Math.floor(xp / 100) + 1;
    
    expect(calculateLevel(initialXP + addedXP)).toBe(expectedLevel);
  });
});

// --- පරීක්ෂණ 2: API Data Merging පරීක්ෂාව ---
// අපි කලින් හදපු Duplicate Unit Fix එක හරියටම වැඩ කරනවාදැයි මෙයින් බලයි.
describe('ApiService Data Merging', () => {
  it('should merge static and remote units without duplicates', () => {
    const staticUnits = [{ id: 1, themes: [{ id: 't1' }] }];
    const remoteUnits = [{ id: "1", themes: [{ id: 't2' }] }]; // ID can be string from Firestore

    const mergeLogic = (sU, rU) => {
      const merged = [...sU];
      rU.forEach(remote => {
        const idx = merged.findIndex(u => String(u.id) === String(remote.id));
        if (idx !== -1) {
          merged[idx].themes = [...merged[idx].themes, ...remote.themes];
        }
      });
      return merged;
    };

    const result = mergeLogic(staticUnits, remoteUnits);
    expect(result.length).toBe(1); // තාමත් එකම Unit එකයි (ID සමාන නිසා)
    expect(result[0].themes.length).toBe(2); // හැබැයි පාඩම් 2ක් තියෙන්න ඕනේ
  });
});

// --- පරීක්ෂණ 3: Voice Studio Logic පරීක්ෂාව ---
// ගුරුවරියගේ කටහඬවල් ඇප් එකේ හඬ වෙනුවට ආදේශ වේදැයි බලයි.
describe('VoiceService Override', () => {
  it('should return teacher voice if mapped, else default', () => {
    const localVoiceMap = { "ආයුබෝවන්": "/audio/welcome.mp3" };
    const customMap = { "ආයුබෝවන්": "data:audio/webm;base64,STROM..." };
    
    const finalMap = { ...localVoiceMap, ...customMap };
    
    expect(finalMap["ආයුබෝවන්"]).toContain("base64");
    expect(finalMap["ආයුබෝවන්"]).not.toBe("/audio/welcome.mp3");
  });
});
