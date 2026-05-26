import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// ── Transactions ──────────────────────────────────────────────────────────────
export const addTransaction = (userId, data) =>
  addDoc(collection(db, "transactions"), {
    ...data, userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateTransaction = (id, data) =>
  updateDoc(doc(db, "transactions", id), { ...data, updatedAt: serverTimestamp() });

export const deleteTransaction = (id) =>
  deleteDoc(doc(db, "transactions", id));

export const getTransactionsRealtime = (userId, callback) => {
  const q = query(collection(db, "transactions"), where("userId", "==", userId));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

// ── Budgets ───────────────────────────────────────────────────────────────────
export const addBudget = (userId, data) =>
  addDoc(collection(db, "budgets"), {
    ...data, userId,
    createdAt: serverTimestamp(),
  });

export const updateBudget = (id, data) =>
  updateDoc(doc(db, "budgets", id), { ...data, updatedAt: serverTimestamp() });

export const deleteBudget = (id) => deleteDoc(doc(db, "budgets", id));

export const getBudgetsRealtime = (userId, callback) => {
  const q = query(collection(db, "budgets"), where("userId", "==", userId));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

// ── Savings Goals ─────────────────────────────────────────────────────────────
export const addSavingsGoal = (userId, data) =>
  addDoc(collection(db, "savingsGoals"), {
    ...data, userId, saved: 0,
    createdAt: serverTimestamp(),
  });

export const updateSavingsGoal = (id, data) =>
  updateDoc(doc(db, "savingsGoals", id), { ...data, updatedAt: serverTimestamp() });

export const deleteSavingsGoal = (id) => deleteDoc(doc(db, "savingsGoals", id));

export const getSavingsGoalsRealtime = (userId, callback) => {
  const q = query(collection(db, "savingsGoals"), where("userId", "==", userId));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};
