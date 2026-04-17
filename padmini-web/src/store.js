import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// පද්මිනී Web Service Store (Advanced Achievements & Audio Pre-loading Logic)
export const usePadminiStore = create(
  persist(
    (set, get) => ({
      userId: '',
      userName: '',
      userGrade: 3,
      avatarId: 'owl',
      currentScreen: 'path',
      xp: 0,
      gems: 50,
      hearts: 5,
      level: 1,
      streak: 0,
      lastActive: null,

      completedLessonIds: [],

      // දක්ෂතා ලාංඡන (Achievements)
      achievements: [
        { id: 'first_step', title: 'පළමු පියවර', desc: 'පළමු පාඩම අවසන් කළා', icon: '🏃', earned: false },
        { id: 'gem_king', title: 'මැණික් රජා', desc: 'මැණික් 100ක් එකතු කළා', icon: '💎', earned: false },
        { id: 'streak_star', title: 'නොකඩවා ඉගෙනුම', desc: 'දින 3ක් එක දිගට පැමිණියා', icon: '🔥', earned: false },
      ],

      customLessons: [],
      dailyQuests: [
        { id: 1, text: "අද පාඩම් 2ක් අවසන් කරන්න", goal: 2, current: 0, reward: 20, completed: false },
        { id: 2, text: "අද XP 50ක් ලබා ගන්න", goal: 50, current: 0, reward: 15, completed: false }
      ],
      missedQuestions: {},
      mistakesByTheme: {},

      setUserName: (name) => {
        const id = get().userId || `user_${Math.random().toString(36).substr(2, 9)}`;
        set({ userName: name, userId: id });
      },

      setGrade: (grade) => set({ userGrade: grade }),
      setAvatar: (id) => set({ avatarId: id }),
      setScreen: (screen) => set({ currentScreen: screen }),

      addXP: (amount) => set((state) => {
        const newXP = state.xp + amount;
        const newLevel = Math.floor(newXP / 100) + 1;
        return { xp: newXP, level: newLevel };
      }),

      addGems: (amount) => set((state) => {
        const newGems = state.gems + amount;
        // Check for Gem King Achievement
        const newAchievements = state.achievements.map(a =>
          a.id === 'gem_king' && newGems >= 100 ? { ...a, earned: true } : a
        );
        return { gems: newGems, achievements: newAchievements };
      }),

      completeLesson: (score, total, lessonId) => {
        const { addXP, addGems } = get();
        addXP(score * 10);
        addGems(5);

        set((state) => {
          const newCompleted = !state.completedLessonIds.includes(lessonId)
            ? [...state.completedLessonIds, lessonId]
            : state.completedLessonIds;

          // Check for First Step Achievement
          const newAchievements = state.achievements.map(a =>
            a.id === 'first_step' && newCompleted.length >= 1 ? { ...a, earned: true } : a
          );

          return {
            streak: state.streak + 1,
            completedLessonIds: newCompleted,
            achievements: newAchievements,
            currentScreen: 'completion'
          };
        });
      },

      trackMistake: (themeTitle, qData) => set((state) => {
        const currentCount = state.mistakesByTheme[themeTitle] || 0;
        return {
          hearts: Math.max(0, state.hearts - 1),
          mistakesByTheme: { ...state.mistakesByTheme, [themeTitle]: currentCount + 1 },
          missedQuestions: { ...state.missedQuestions, [qData.id || Math.random()]: { data: qData, correctCount: 0 } }
        };
      }),

      resetProgress: () => set({
        userName: '', xp: 0, gems: 50, hearts: 5, level: 1, streak: 0,
        completedLessonIds: [], achievements: [
          { id: 'first_step', title: 'පළමු පියවර', desc: 'පළමු පාඩම අවසන් කළා', icon: '🏃', earned: false },
          { id: 'gem_king', title: 'මැණික් රජා', desc: 'මැණික් 100ක් එකතු කළා', icon: '💎', earned: false },
          { id: 'streak_star', title: 'නොකඩවා ඉගෙනුම', desc: 'දින 3ක් එක දිගට පැමිණියා', icon: '🔥', earned: false },
        ]
      })
    }),
    { name: 'padmini-storage' }
  )
);
