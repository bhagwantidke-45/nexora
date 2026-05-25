import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const today = () => new Date().toISOString().slice(0, 10);

// Add Habit
export const addHabit = async (userId, habitData) => {
  return await addDoc(collection(db, "habits"), {
    ...habitData,
    userId,
    streak: 0,
    completedDates: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update Habit
export const updateHabit = async (habitId, habitData) => {
  const habitRef = doc(db, "habits", habitId);
  return await updateDoc(habitRef, {
    ...habitData,
    updatedAt: serverTimestamp(),
  });
};

// Delete Habit
export const deleteHabit = async (habitId) => {
  return await deleteDoc(doc(db, "habits", habitId));
};

// Toggle Habit Completion for Today
export const toggleHabitToday = async (habitId, completedDates, currentStreak) => {
  const habitRef = doc(db, "habits", habitId);
  const todayDate = today();
  let newDates = [...completedDates];
  let newStreak = currentStreak;

  if (newDates.includes(todayDate)) {
    // Uncheck today
    newDates = newDates.filter((d) => d !== todayDate);
    newStreak = Math.max(0, newStreak - 1);
  } else {
    // Check today
    newDates.push(todayDate);
    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (newDates.includes(yesterdayStr)) {
      newStreak = newStreak + 1;
    } else {
      newStreak = 1;
    }
  }

  return await updateDoc(habitRef, {
    completedDates: newDates,
    streak: newStreak,
    updatedAt: serverTimestamp(),
  });
};

// Get Habits Realtime
export const getHabitsRealtime = (userId, callback) => {
  const q = query(
    collection(db, "habits"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(habits);
  });
};