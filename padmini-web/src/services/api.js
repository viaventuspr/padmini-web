import { db } from '../firebase';
import {
  collection,
  setDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  limit,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { units as staticUnits } from '../data/lessons';

// සටහන: Firebase SDK v10+ වල enableIndexedDbPersistence අවශ්‍ය නැත.
// එය ස්වයංක්‍රීයව backend මගින් පාලනය වේ.

const ApiService = {
  // 🚀 අති වේගවත් දත්ත ලබා ගැනීම (Instant Load + Background Sync)
  getUnits: (callback) => {
    // 1. වහාම පවතින Static දත්ත ලබා දෙයි
    callback(staticUnits);

    if (!db) return () => {};

    try {
      const q = query(collection(db, "units"), orderBy("id", "asc"));
      // 2. Cloud එකෙන් දත්ත එන විට එය පමණක් වෙනස් කරයි
      return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) return;

        const dbUnits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allUnits = [...staticUnits];

        dbUnits.forEach(dbU => {
            const index = allUnits.findIndex(u => String(u.id) === String(dbU.id));
            if (index !== -1) {
                // If the static unit already has themes, we merge newly added themes!
                const existingThemes = allUnits[index].themes || [];
                const dbThemes = dbU.themes || [];
                // Merge themes based on ID
                const mergedThemes = [...existingThemes];
                dbThemes.forEach(dt => {
                    const tIndex = mergedThemes.findIndex(et => String(et.id) === String(dt.id));
                    if (tIndex !== -1) mergedThemes[tIndex] = dt;
                    else mergedThemes.push(dt);
                });
                allUnits[index] = { ...allUnits[index], ...dbU, themes: mergedThemes };
            }
            else allUnits.push(dbU);
        });

        callback(allUnits.sort((a, b) => a.id - b.id));
      }, (error) => {
        console.error("Firestore Sync Error:", error.message);
      });
    } catch (e) {
      return () => {};
    }
  },

  // සජීවී ලකුණු පුවරුව (Top 10)
  getLeaderboard: (callback) => {
    if (!db) return () => {};
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(10));
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(users);
    });
  },

  // පරිශීලක ප්‍රගතිය Cloud එකේ සුරැකීම
  saveUserProgress: async (userId, data) => {
    if (!db || !userId) return;
    try {
      await setDoc(doc(db, "users", userId), {
        ...data,
        lastActive: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      console.log("✅ ප්‍රගතිය Cloud එක සමඟ Sync වුණා.");
    } catch (e) {
      console.error("❌ Sync Error:", e.message);
    }
  },

  // අලුත් පාඩමක් Publish කිරීම (Admin සඳහා)
  publishLesson: async (unitId, lessonData) => {
    if (!db) return;
    try {
      const unitRef = doc(db, "units", String(unitId));
      await updateDoc(unitRef, {
        themes: arrayUnion(lessonData),
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (e) {
      if (e.code === 'not-found') {
        const adminUnit = { id: unitId, title: "මාර්ගගත පාඩම් (Online)", themes: [lessonData] };
        await setDoc(doc(db, "units", String(unitId)), { ...adminUnit, updatedAt: new Date().toISOString() });
        return true;
      }
      console.error("Publish Error:", e);
      throw e;
    }
  }
};

export default ApiService;
