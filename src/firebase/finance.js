import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot, serverTimestamp,
  getDocs, orderBy,
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

// ── Monthly Summaries ─────────────────────────────────────────────────────────
export const saveMonthSummary = (userId, month, data) =>
  addDoc(collection(db, "monthSummaries"), {
    ...data, userId, month,
    createdAt: serverTimestamp(),
  });

export const updateMonthSummary = (id, data) =>
  updateDoc(doc(db, "monthSummaries", id), { ...data, updatedAt: serverTimestamp() });

export const getMonthSummariesRealtime = (userId, callback) => {
  const q = query(collection(db, "monthSummaries"), where("userId", "==", userId));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

// ── Bill Splits ───────────────────────────────────────────────────────────────
export const addBillSplit = (userId, data) =>
  addDoc(collection(db, "billSplits"), {
    ...data, userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateBillSplit = (id, data) =>
  updateDoc(doc(db, "billSplits", id), { ...data, updatedAt: serverTimestamp() });

export const deleteBillSplit = (id) => deleteDoc(doc(db, "billSplits", id));

export const getBillSplitsRealtime = (userId, callback) => {
  const q = query(collection(db, "billSplits"), where("userId", "==", userId));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};