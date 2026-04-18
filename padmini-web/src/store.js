import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// පද්මිනී Web Service Store (The Ultimate Master Engine)
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

      achievements: [
        { id: 'perfect_score', title: 'විශිෂ්ටයා', desc: 'සියලුම ප්‍රශ්න නිවැරදි කළා', icon: '🌟', earned: false },
        { id: 'fast_learner', title: 'වේගවත් ඉගෙනුම', desc: 'මිනිත්තු 2කට අඩුවෙන් පාඩමක් නිම කළා', icon: '⚡', earned: false },
        { id: 'gem_collector', title: 'මැණික් රජා', desc: 'මැණික් 200ක් එකතු කළා', icon: '💎', earned: false },
        { id: 'streak_king', title: 'අකණ්ඩ ඉගෙනුම', desc: 'දින 3ක් එක දිගට පැමිණියා', icon: '🔥', earned: false },
      ],
      newAchievementNotif: null,

      dailyQuests: [
        { id: 1, text: "අද පාඩම් 2ක් අවසන් කරන්න", goal: 2, current: 0, reward: 20, completed: false },
        { id: 2, text: "අද XP 50ක් ලබා ගන්න", goal: 50, current: 0, reward: 15, completed: false }
      ],
      missedQuestions: {},
      mistakesByTheme: {},
      totalStudyTime: 0,

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
        const newQuests = state.dailyQuests.map(q =>
          q.id === 2 ? { ...q, current: q.current + amount, completed: (q.current + amount) >= q.goal } : q
        );
        return { xp: newXP, level: newLevel, dailyQuests: newQuests };
      }),

      addGems: (amount) => {
        const currentGems = get().gems;
        const newGems = Math.max(0, currentGems + amount);
        set({ gems: newGems });

        if (newGems >= 200 && !get().achievements.find(a => a.id === 'gem_collector').earned) {
            get().earnAchievement('gem_collector');
        }
      },

      earnAchievement: (id) => set((state) => {
        const achievement = state.achievements.find(a => a.id === id);
        if (achievement && !achievement.earned) {
            return {
                achievements: state.achievements.map(a => a.id === id ? { ...a, earned: true } : a),
                newAchievementNotif: achievement
            };
        }
        return {};
      }),

      clearAchievementNotif: () => set({ newAchievementNotif: null }),

      completeLesson: (score, total, lessonId, duration) => {
        const { addXP, addGems, earnAchievement, streak, lastActive } = get();
        addXP(score * 10);
        addGems(5);

        if (score === total) earnAchievement('perfect_score');
        if (duration < 120) earnAchievement('fast_learner');

        // Streak logic
        const now = new Date();
        const lastDate = lastActive ? new Date(lastActive) : null;
        let newStreak = streak;

        if (!lastDate || (now - lastDate) > 86400000) {
            newStreak += 1;
            if (newStreak >= 3) earnAchievement('streak_king');
        }

        set((state) => ({
          streak: newStreak,
          lastActive: now.toISOString(),
          completedLessonIds: state.completedLessonIds.includes(lessonId) ? state.completedLessonIds : [...state.completedLessonIds, lessonId],
          currentScreen: 'completion',
          dailyQuests: state.dailyQuests.map(q =>
            q.id === 1 ? { ...q, current: q.current + 1, completed: (q.current + 1) >= q.goal } : q
          )
        }));
      },

      addStudyTime: (seconds) => set((state) => ({ totalStudyTime: state.totalStudyTime + seconds })),

      trackMistake: (themeTitle, qData) => set((state) => {
        const currentCount = state.mistakesByTheme[themeTitle] || 0;
        return {
          hearts: Math.max(0, state.hearts - 1),
          mistakesByTheme: { ...state.mistakesByTheme, [themeTitle]: currentCount + 1 },
          missedQuestions: { ...state.missedQuestions, [qData.id || Math.random()]: { data: qData, correctCount: 0 } }
        };
      }),

      resetProgress: () => {
        set({
          userName: '', xp: 0, gems: 50, hearts: 5, level: 1, streak: 0,
          completedLessonIds: [], totalStudyTime: 0, mistakesByTheme: {},
          missedQuestions: {}, dailyQuests: [
            { id: 1, text: "අද පාඩම් 2ක් අවසන් කරන්න", goal: 2, current: 0, reward: 20, completed: false },
            { id: 2, text: "අද XP 50ක් ලබා ගන්න", goal: 50, current: 0, reward: 15, completed: false }
          ]
        });
        localStorage.removeItem('padmini-storage');
      }
    }),
    { name: 'padmini-storage' }
  )
);
