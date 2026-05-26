import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export const addGoal = (userId, data) =>
  addDoc(collection(db, "goals"), {
    ...data, userId,
    milestones: data.milestones || [],
    progress: data.progress || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateGoal = (id, data) =>
  updateDoc(doc(db, "goals", id), { ...data, updatedAt: serverTimestamp() });

export const deleteGoal = (id) => deleteDoc(doc(db, "goals", id));

export const getGoalsRealtime = (userId, callback) => {
  const q = query(collection(db, "goals"), where("userId", "==", userId));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};
