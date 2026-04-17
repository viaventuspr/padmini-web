import { db } from '../firebase';
import {
  collection,
  setDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  limit,
  where,
  getDocs
} from "firebase/firestore";
import { units as staticUnits } from '../data/lessons';

const ApiService = {
  checkSystemHealth: async () => {
    return { firebase: !!db, timestamp: new Date().toISOString() };
  },

  // සියලුම ඒකක සහ පාඩම් ලබා ගැනීම (Hybrid: Static + Cloud)
  getUnits: (callback) => {
    if (!db) {
      callback(staticUnits);
      return () => {};
    }

    try {
      const q = query(collection(db, "units"), orderBy("id", "asc"));
      return onSnapshot(q, (snapshot) => {
        const dbUnits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Static ඒකක සහ Cloud ඒකක එකතු කිරීම
        const allUnits = [...staticUnits];
        dbUnits.forEach(dbU => {
            const index = allUnits.findIndex(u => u.id === dbU.id);
            if (index !== -1) allUnits[index] = dbU;
            else allUnits.push(dbU);
        });
        callback(allUnits.sort((a, b) => a.id - b.id));
      }, () => callback(staticUnits));
    } catch (e) {
      callback(staticUnits);
      return () => {};
    }
  },

  // ලකුණු පුවරුව ලබා ගැනීම (සජීවීව)
  getLeaderboard: (callback) => {
    if (!db) return () => {};
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(20));
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
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Sync Error:", e);
    }
  },

  // අලුත් පාඩමක් Publish කිරීම (Admin සඳහා)
  publishLesson: async (unitId, lessonData) => {
    if (!db) return;
    const unitRef = doc(db, "units", String(unitId));
    // මෙහිදී ඒකකය ඇතුළේ ඇති පාඩම් ලැයිස්තුවට අලුත් පාඩම එකතු කරයි
    // සටහන: Firestore 'arrayUnion' භාවිතා කිරීම වඩාත් සුදුසුයි
  }
};

export default ApiService;
