import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, messaging } from './firebase';
import { getToken } from 'firebase/messaging';

// පද්මිනී Web Service Store (The Ultimate Robust Admin Engine - Strom v4)
export const usePadminiStore = create(
  persist(
    (set, get) => ({
      userId: '',
      userName: '',
      userEmail: '',
      isAdmin: false,
      userGrade: 3,
      avatarId: 'fairy',
      lastSyncTime: 0,
      currentScreen: 'path',
      xp: 0,
      gems: 50,
      hearts: 5,
      level: 1,
      streak: 0,
      totalStudyTime: 0,
      completedLessonIds: [],
      missedQuestions: {}, // අනිවාර්යයෙන්ම Object එකක් ලෙස ආරම්භ විය යුතුයි
      mistakesByTheme: {}, // අනිවාර්යයෙන්ම Object එකක් ලෙස ආරම්භ විය යුතුයි
      dailyQuests: [],
      achievements: [],
      newAchievementNotif: null,
      isAuthLoading: false,
      activeLesson: null,
      masteryPool: [], // අමාරු ප්‍රශ්න එකතුව

      // 🛡️ OWASP Secure Middleware: පරිශීලකයා Admin කෙනෙක්දැයි Backend සම්මතයෙන් පරීක්ෂා කිරීම (BAC / Role Enforcement)
      setAuthUser: async (user) => {
        if (!user) {
          set({ isAuthLoading: false });
          return;
        }
        set({ isAuthLoading: true });

        let isUserAdmin = false;
        try {
          if (db) {
            // Local Development Bypass: localhost එකේදී සැමවිටම Admin පෙන්වීම
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
               isUserAdmin = true;
            } else {
               const roleDocRef = doc(db, 'userRoles', user.uid);
               const roleSnap = await getDoc(roleDocRef);
               if (roleSnap.exists() && roleSnap.data().role === 'admin') {
                 isUserAdmin = true;
               } else {
                 const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || '';
                 const adminList = adminEmailsStr.split(',').map(e => e.trim().toLowerCase());
                 if (adminList.includes(user.email?.toLowerCase())) {
                    isUserAdmin = true;
                 }
               }
            }
          }
        } catch (e) {
          console.error("Secure role verification failed:", e);
        }

        // --- Safety Wrapped Push Notification Setup ---
        let fcmToken = null;
        try {
           // බ්‍රව්සරය Notification වලට සපෝට් කරයිදැයි බලයි
           if (typeof window !== 'undefined' && 'Notification' in window && messaging) {
              const permission = Notification.permission === 'default' 
                ? await Notification.requestPermission() 
                : Notification.permission;
                
              if (permission === 'granted') {
                 const vKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
                 if (vKey) {
                    fcmToken = await getToken(messaging, { vapidKey: vKey });
                 } else {
                    console.warn("VITE_FIREBASE_VAPID_KEY missing in Env.");
                 }
              }
           }
        } catch(e) { 
           console.error("Notification Setup Error (Bypassing to prevent crash):", e); 
        }

        set({
            userId: user.uid,
            userName: user.displayName || 'ඉගෙනුම් යාළුවා',
            userEmail: user.email?.toLowerCase() || '',
            isAdmin: isUserAdmin,
            fcmToken: fcmToken,
            isAuthLoading: false
        });
      },

      setUserName: (name) => set({ userName: name }),
      setGrade: (grade) => set({ userGrade: grade }),
      setAvatar: (id) => set({ avatarId: id }),
      setScreen: (screen) => set({ currentScreen: screen }),
      setActiveLesson: (lesson) => set({ activeLesson: lesson }),
      addStudyTime: (seconds) => set((state) => ({ totalStudyTime: (state.totalStudyTime || 0) + seconds })),

      addXP: (amount) => set((state) => {
        const newXP = (state.xp || 0) + amount;
        return { xp: newXP, level: Math.floor(newXP / 100) + 1 };
      }),

      addGems: (amount) => set((state) => ({ gems: Math.max(0, (state.gems || 0) + amount) })),

      saveProgressToCloud: async () => {
        const { userId, userName, xp, level, streak, gems, completedLessonIds, isAdmin } = get();
        if (!userId || !db) return;

        // Write-Back Strategy: දත්ත තොග වශයෙන් Cloud වෙත යැවීම (Batch Sync)
        const syncData = { userName, xp, level, streak, gems, completedLessonIds, isAdmin };
        try {
          const ApiService = (await import('./services/api')).default;
          await ApiService.saveUserProgress(userId, syncData);
          set({ lastSyncTime: Date.now() });
        } catch (e) {
          console.warn("Write-Back Sync Failed, data remains in local cache.", e);
        }
      },

      completeLesson: (score, total, lessonId) => {
        const { addXP, addGems, saveProgressToCloud } = get();
        addXP(score * 10);
        addGems(5);
        set((state) => ({
          streak: (state.streak || 0) + 1,
          completedLessonIds: Array.isArray(state.completedLessonIds)
            ? (state.completedLessonIds.includes(lessonId) ? state.completedLessonIds : [...state.completedLessonIds, lessonId])
            : [lessonId],
          currentScreen: 'completion'
        }));
        // පියවර අවසානයේ ස්වයංක්‍රීයව Cloud එක සමඟ Sync කරයි (Write-Back)
        saveProgressToCloud();
      },

      trackMistake: (themeTitle, qData) => set((state) => {
        const currentMistakes = state.mistakesByTheme || {};
        const currentMissed = state.missedQuestions || {};
        const qId = qData.id || Date.now();
        const existingMissed = currentMissed[qId] || { data: qData, count: 0 };
        
        const newMissed = { 
          ...currentMissed, 
          [qId]: { ...existingMissed, count: (existingMissed.count || 0) + 1 } 
        };

        // වැරදුණු ප්‍රශ්න Pool එකට එක් කිරීම
        const masteryPool = Object.values(newMissed)
          .filter(item => item.count >= 1)
          .map(item => item.data);

        return {
          hearts: Math.max(0, (state.hearts || 5) - 1),
          mistakesByTheme: { ...currentMistakes, [themeTitle]: (currentMistakes[themeTitle] || 0) + 1 },
          missedQuestions: newMissed,
          masteryPool
        };
      }),

      clearAchievementNotif: () => set({ newAchievementNotif: null }),

      resetProgress: () => {
        set({
          userName: '', userEmail: '', isAdmin: false, xp: 0, gems: 50, hearts: 5, level: 1, streak: 0, totalStudyTime: 0,
          completedLessonIds: [], missedQuestions: {}, mistakesByTheme: {}, dailyQuests: [], achievements: []
        });
        localStorage.removeItem('padmini-storage');
      }
    }),
    {
        name: 'padmini-storage',
        // දත්ත නැවත ලබා ගැනීමේදී ඇතිවන දෝෂ වළක්වන ප්‍රබල ආරක්ෂක වැට
        onRehydrateStorage: () => (state) => {
            if (state) {
                if (!Array.isArray(state.completedLessonIds)) state.completedLessonIds = [];
                if (!state.missedQuestions || typeof state.missedQuestions !== 'object') state.missedQuestions = {};
                if (!state.mistakesByTheme || typeof state.mistakesByTheme !== 'object') state.mistakesByTheme = {};
                // Force return to home if stuck
                if (state.currentScreen === 'admin' && !state.isAdmin) state.currentScreen = 'path';
            }
            return state;
        }
    }
  )
);
