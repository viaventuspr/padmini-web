import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// පද්මිනී Web Service Store (The Ultimate Robust Admin Engine)
export const usePadminiStore = create(
  persist(
    (set, get) => ({
      userId: '',
      userName: '',
      userEmail: '',
      isAdmin: false,
      userGrade: 3,
      avatarId: 'owl',
      currentScreen: 'path',
      xp: 0,
      gems: 50,
      hearts: 5,
      level: 1,
      streak: 0,
      completedLessonIds: [],

      // 🛡️ Middleware Logic: Admin Emails ලැයිස්තුව .env එකෙන් කියවයි
      setAuthUser: (user) => {
        const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || 'viaventus.pr@gmail.com';
        const adminList = adminEmailsStr.split(',').map(e => e.trim().toLowerCase());

        const isUserAdmin = adminList.includes(user.email?.toLowerCase());

        set({
            userId: user.uid,
            userName: user.displayName || 'ඉගෙනුම් යාළුවා',
            userEmail: user.email,
            isAdmin: isUserAdmin
        });

        console.log(isUserAdmin ? "✅ Admin Access Granted" : "👤 Student Access Granted");
      },

      setUserName: (name) => set({ userName: name }),
      setGrade: (grade) => set({ userGrade: grade }),
      setAvatar: (id) => set({ avatarId: id }),
      setScreen: (screen) => set({ currentScreen: screen }),

      addXP: (amount) => set((state) => {
        const newXP = state.xp + amount;
        return { xp: newXP, level: Math.floor(newXP / 100) + 1 };
      }),

      addGems: (amount) => set((state) => ({ gems: Math.max(0, state.gems + amount) })),

      completeLesson: (score, total, lessonId) => {
        const { addXP, addGems } = get();
        addXP(score * 10);
        addGems(5);
        set((state) => ({
          streak: state.streak + 1,
          completedLessonIds: state.completedLessonIds.includes(lessonId) ? state.completedLessonIds : [...state.completedLessonIds, lessonId],
          currentScreen: 'completion'
        }));
      },

      resetProgress: () => {
        set({
          userName: '', userEmail: '', isAdmin: false, xp: 0, gems: 50, hearts: 5, level: 1, streak: 0,
          completedLessonIds: []
        });
        localStorage.removeItem('padmini-storage');
      }
    }),
    { name: 'padmini-storage' }
  )
);
