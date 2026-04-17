import { describe, it, expect, beforeEach } from 'vitest';
import { usePadminiStore } from './store';

describe('පද්මිනී Store Unit Tests', () => {
  beforeEach(() => {
    // සෑම ටෙස්ට් එකකටම පෙර Store එක Reset කිරීම
    usePadminiStore.getState().resetProgress();
  });

  it('XP එකතු වන විට Level එක නිවැරදිව ගණනය විය යුතුය', () => {
    const { addXP } = usePadminiStore.getState();

    addXP(150); // 150 XP එකතු කිරීම

    const state = usePadminiStore.getState();
    expect(state.xp).toBe(150);
    expect(state.level).toBe(2); // 100 XP පසුව Level 2 විය යුතුයි
  });

  it('වැරදි පිළිතුරකදී ජීවිතයක් (Heart) අඩු විය යුතුය', () => {
    const { trackMistake } = usePadminiStore.getState();
    const initialHearts = usePadminiStore.getState().hearts;

    const mockQuestion = { id: 1, q: "Test?" };
    trackMistake("පරිසරය", mockQuestion);

    const state = usePadminiStore.getState();
    expect(state.hearts).toBe(initialHearts - 1);
  });

  it('පාඩමක් අවසන් කළ විට මැණික් (Gems) ලැබිය යුතුය', () => {
    const { completeLesson } = usePadminiStore.getState();
    const initialGems = usePadminiStore.getState().gems;

    completeLesson(10, 10); // ප්‍රශ්න 10න් 10ම නිවැරදියි

    const state = usePadminiStore.getState();
    expect(state.gems).toBe(initialGems + 5);
  });

  it('Daily Quest ප්‍රගතිය නිවැරදිව සටහන් විය යුතුය', () => {
    const { addXP } = usePadminiStore.getState();

    addXP(60); // "අද XP 50ක් ලබා ගන්න" මෙහෙයුම සම්පූර්ණ කළ යුතුයි

    const state = usePadminiStore.getState();
    const xpQuest = state.dailyQuests.find(q => q.id === 2);
    expect(xpQuest.completed).toBe(true);
  });
});
